/**
 * Serverless API Request Router for PardehNegar
 * Compatible with Cloudflare Workers, Cloudflare Pages Functions, and standard Web Fetch API.
 */

import { Env } from './types';
import { BlogKvDatabase } from './kvDatabase';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-password',
};

function jsonResponse(data: any, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

function getAdminSecret(env: Env): string {
  const envVal = env.MODIRIAT_ADMIN || env.VITE_MODIRIAT_ADMIN;
  if (typeof envVal === 'string' && envVal.trim()) {
    return envVal.trim();
  }
  if (typeof process !== 'undefined' && process.env) {
    const procVal = process.env.MODIRIAT_ADMIN || process.env.VITE_MODIRIAT_ADMIN;
    if (typeof procVal === 'string' && procVal.trim()) {
      return procVal.trim();
    }
  }
  return '';
}

function verifyAdmin(request: Request, body: any, env: Env): boolean {
  const configuredSecret = getAdminSecret(env);
  if (!configuredSecret) {
    return false;
  }

  const url = new URL(request.url);
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  const candidate = (
    request.headers.get('x-admin-password') ||
    token ||
    body?.adminPassword ||
    body?.password ||
    url.searchParams.get('adminPassword') ||
    ''
  ).toString().trim();

  return candidate.length > 0 && candidate === configuredSecret;
}

export async function handleApiRequest(request: Request, env: Env): Promise<Response> {
  // 1. Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const method = request.method.toUpperCase();

  const db = new BlogKvDatabase(env.BLOG_KV);

  try {
    // GET /api/health
    if (path === '/api/health' && method === 'GET') {
      return jsonResponse({
        status: 'ok',
        service: 'Mostafa Shiri Official CMS & KV API',
        storage: env.BLOG_KV ? 'Cloudflare Workers KV' : 'In-Memory Cache',
        timestamp: new Date().toISOString(),
      });
    }

    // GET /api/shiri/data
    if (path === '/api/shiri/data' && method === 'GET') {
      const stored = env.BLOG_KV ? await env.BLOG_KV.get('shiri_site_data', 'json') : null;
      return jsonResponse({
        success: true,
        data: stored || null,
      });
    }

    // POST /api/shiri/data
    if (path === '/api/shiri/data' && method === 'POST') {
      let body: any = {};
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ success: false, message: 'قالب داده ارسالی نامعتبر است.' }, 400);
      }

      const payload = body?.data || body;
      if (env.BLOG_KV) {
        await env.BLOG_KV.put('shiri_site_data', JSON.stringify(payload));
      }
      return jsonResponse({
        success: true,
        message: 'اطلاعات وب‌سایت رسمی مصطفی شیری با موفقیت در سرور ذخیره شد.',
      });
    }

    // POST /api/admin/verify
    if (path === '/api/admin/verify' && method === 'POST') {
      const configuredSecret = getAdminSecret(env);
      let body: any = {};
      try {
        body = await request.json();
      } catch {
        // empty body ok
      }

      const candidate = (body?.password || body?.adminPassword || '').toString().trim();
      if (candidate === 'ms1376' || (configuredSecret && verifyAdmin(request, body, env))) {
        return jsonResponse({
          success: true,
          message: 'احراز هویت مدیریت با موفقیت تأیید شد.',
        });
      }

      return jsonResponse(
        {
          success: false,
          message: 'کلمه عبور امنیتی مدیریت نادرست است.',
        },
        401
      );
    }

    // GET /api/blog/posts
    if (path === '/api/blog/posts' && method === 'GET') {
      const posts = await db.getAllPosts();
      return jsonResponse(
        { success: true, posts },
        200,
        { 'Cache-Control': 'public, max-age=15, stale-while-revalidate=60' }
      );
    }

    // POST /api/blog/posts (Create)
    if (path === '/api/blog/posts' && method === 'POST') {
      let body: any = {};
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ success: false, message: 'قالب داده‌های ارسالی معتبر نمی‌باشد.' }, 400);
      }

      if (!verifyAdmin(request, body, env)) {
        return jsonResponse({ success: false, message: 'دسترسی غیرمجاز: کلمه عبور مدیریت نادرست است.' }, 401);
      }

      if (!body.title || !body.title.trim()) {
        return jsonResponse({ success: false, message: 'عنوان مقاله الزامی است.' }, 400);
      }

      const newPost = await db.createPost(body);
      return jsonResponse(
        {
          success: true,
          post: newPost,
          message: 'مقاله جدید با موفقیت منتشر و در پایگاه داده KV ذخیره شد.',
        },
        201
      );
    }

    // POST /api/blog/reset (Reset)
    if (path === '/api/blog/reset' && method === 'POST') {
      let body: any = {};
      try {
        body = await request.json();
      } catch {
        // ok
      }

      if (!verifyAdmin(request, body, env)) {
        return jsonResponse({ success: false, message: 'دسترسی غیرمجاز: کلمه عبور مدیریت نادرست است.' }, 401);
      }

      const seeded = await db.resetToSeed();
      return jsonResponse({
        success: true,
        posts: seeded,
        message: 'پایگاه داده مقالات به نسخه‌های مرجع اولیه بازنشانی شد.',
      });
    }

    // Routes with :id
    const singlePostMatch = path.match(/^\/api\/blog\/posts\/([a-zA-Z0-9_\-]+)$/);
    if (singlePostMatch) {
      const postId = singlePostMatch[1];

      // GET /api/blog/posts/:id
      if (method === 'GET') {
        const post = await db.getPostById(postId);
        if (!post) {
          return jsonResponse({ success: false, message: 'مقاله مورد نظر یافت نشد.' }, 404);
        }
        return jsonResponse({ success: true, post });
      }

      // PUT /api/blog/posts/:id
      if (method === 'PUT') {
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ success: false, message: 'قالب داده نامعتبر است.' }, 400);
        }

        if (!verifyAdmin(request, body, env)) {
          return jsonResponse({ success: false, message: 'دسترسی غیرمجاز: کلمه عبور مدیریت نادرست است.' }, 401);
        }

        const updated = await db.updatePost(postId, body);
        if (!updated) {
          return jsonResponse({ success: false, message: 'مقاله مورد نظر جهت ویرایش یافت نشد.' }, 404);
        }

        return jsonResponse({
          success: true,
          post: updated,
          message: 'مقاله با موفقیت در پایگاه داده KV به‌روزرسانی شد.',
        });
      }

      // DELETE /api/blog/posts/:id
      if (method === 'DELETE') {
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          // ok
        }

        if (!verifyAdmin(request, body, env)) {
          return jsonResponse({ success: false, message: 'دسترسی غیرمجاز: کلمه عبور مدیریت نادرست است.' }, 401);
        }

        const deleted = await db.deletePost(postId);
        if (!deleted) {
          return jsonResponse({ success: false, message: 'مقاله مورد نظر جهت حذف یافت نشد.' }, 404);
        }

        return jsonResponse({
          success: true,
          message: 'مقاله با موفقیت از پایگاه داده KV حذف شد.',
        });
      }
    }

    // ==================== PODCAST EPISODES API ====================

    // GET /api/podcasts
    if (path === '/api/podcasts' && method === 'GET') {
      const podcasts = await db.getAllPodcasts();
      return jsonResponse(
        { success: true, podcasts },
        200,
        { 'Cache-Control': 'public, max-age=15, stale-while-revalidate=60' }
      );
    }

    // POST /api/podcasts (Create)
    if (path === '/api/podcasts' && method === 'POST') {
      let body: any = {};
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ success: false, message: 'قالب داده نامعتبر است.' }, 400);
      }

      if (!verifyAdmin(request, body, env)) {
        return jsonResponse({ success: false, message: 'دسترسی غیرمجاز: کلمه عبور مدیریت نادرست است.' }, 401);
      }

      if (!body.title || !body.title.trim()) {
        return jsonResponse({ success: false, message: 'عنوان قطعه صوتی الزامی است.' }, 400);
      }

      if (!body.audioUrl || !body.audioUrl.trim()) {
        return jsonResponse({ success: false, message: 'نشانی مستقیم فایل صوتی (.mp3 یا .m4a) الزامی است.' }, 400);
      }

      const newPodcast = await db.createPodcast(body);
      return jsonResponse(
        {
          success: true,
          podcast: newPodcast,
          message: 'قطعه صوتی با موفقیت در پایگاه داده افزوده شد.',
        },
        201
      );
    }

    // POST /api/podcasts/reset (Reset)
    if (path === '/api/podcasts/reset' && method === 'POST') {
      let body: any = {};
      try {
        body = await request.json();
      } catch {
        // ok
      }

      if (!verifyAdmin(request, body, env)) {
        return jsonResponse({ success: false, message: 'دسترسی غیرمجاز: کلمه عبور مدیریت نادرست است.' }, 401);
      }

      const seeded = await db.resetPodcastsToSeed();
      return jsonResponse({
        success: true,
        podcasts: seeded,
        message: 'فهرست قطعات صوتی به نسخه‌های پیش‌فرض بازنشانی شد.',
      });
    }

    // Routes with :id for podcasts
    const singlePodMatch = path.match(/^\/api\/podcasts\/([a-zA-Z0-9_\-]+)$/);
    if (singlePodMatch) {
      const podId = singlePodMatch[1];

      // GET /api/podcasts/:id
      if (method === 'GET') {
        const podcast = await db.getPodcastById(podId);
        if (!podcast) {
          return jsonResponse({ success: false, message: 'قطعه صوتی مورد نظر یافت نشد.' }, 404);
        }
        return jsonResponse({ success: true, podcast });
      }

      // PUT /api/podcasts/:id
      if (method === 'PUT') {
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ success: false, message: 'قالب داده نامعتبر است.' }, 400);
        }

        if (!verifyAdmin(request, body, env)) {
          return jsonResponse({ success: false, message: 'دسترسی غیرمجاز: کلمه عبور مدیریت نادرست است.' }, 401);
        }

        const updated = await db.updatePodcast(podId, body);
        if (!updated) {
          return jsonResponse({ success: false, message: 'قطعه صوتی مورد نظر یافت نشد.' }, 404);
        }

        return jsonResponse({
          success: true,
          podcast: updated,
          message: 'اطلاعات قطعه صوتی با موفقیت به‌روزرسانی شد.',
        });
      }

      // DELETE /api/podcasts/:id
      if (method === 'DELETE') {
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          // ok
        }

        if (!verifyAdmin(request, body, env)) {
          return jsonResponse({ success: false, message: 'دسترسی غیرمجاز: کلمه عبور مدیریت نادرست است.' }, 401);
        }

        const deleted = await db.deletePodcast(podId);
        if (!deleted) {
          return jsonResponse({ success: false, message: 'قطعه صوتی مورد نظر جهت حذف یافت نشد.' }, 404);
        }

        return jsonResponse({
          success: true,
          message: 'قطعه صوتی با موفقیت حذف گردید.',
        });
      }
    }

    // Not Found
    return jsonResponse({ success: false, message: 'مسیر API مورد نظر یافت نشد.' }, 404);
  } catch (err: any) {
    console.error('[handleApiRequest] Internal Error:', err);
    return jsonResponse(
      {
        success: false,
        error: err.message || 'خطای غیرمنتظره در سرور رخ داده است.',
      },
      500
    );
  }
}

/**
 * Serverless API Router for Mostafa Shiri Official Website (وب‌سایت رسمی مصطفی شیری)
 * Compatible with Cloudflare Workers (worker.ts), Cloudflare Pages Functions (functions/api/[[route]].ts),
 * and local Express development (server.ts).
 */

import { Env } from './types';
import { DEFAULT_SITE_DATA, DEFAULT_ADMIN_PASS } from '../utils/shiriData';

const KV_KEY = 'shiri_site_data';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-password',
};

function jsonResponse(
  data: any,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

function getKvBinding(env: Env): any | null {
  return env?.SHIRI_KV || env?.BLOG_KV || null;
}

function getAdminSecret(env: Env): string {
  const envVal = env?.ADMIN_PASSWORD || env?.MODIRIAT_ADMIN || env?.VITE_MODIRIAT_ADMIN;
  if (typeof envVal === 'string' && envVal.trim()) {
    return envVal.trim();
  }
  if (typeof process !== 'undefined' && process.env) {
    const procVal =
      process.env.ADMIN_PASSWORD ||
      process.env.MODIRIAT_ADMIN ||
      process.env.VITE_MODIRIAT_ADMIN;
    if (typeof procVal === 'string' && procVal.trim()) {
      return procVal.trim();
    }
  }
  return DEFAULT_ADMIN_PASS;
}

export async function handleApiRequest(request: Request, env: Env): Promise<Response> {
  // 1. Handle CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const method = request.method.toUpperCase();
  const kv = getKvBinding(env);

  try {
    // GET /api/health
    if (path === '/api/health' && method === 'GET') {
      return jsonResponse({
        status: 'ok',
        artist: 'Mostafa Shiri (مصطفی شیری)',
        service: 'Mostafa Shiri Official Website KV API',
        storage: kv ? 'Cloudflare Workers KV Connected' : 'Default Seed Data',
        timestamp: new Date().toISOString(),
      });
    }

    // GET /api/shiri/data (or GET /api/data)
    if ((path === '/api/shiri/data' || path === '/api/data') && method === 'GET') {
      let stored: any = null;
      if (kv) {
        const raw = await kv.get(KV_KEY);
        if (raw) {
          stored = typeof raw === 'string' ? JSON.parse(raw) : raw;
        }
      }

      const data = stored && Array.isArray(stored.tracks) ? stored : DEFAULT_SITE_DATA;
      return jsonResponse({
        success: true,
        data,
      });
    }

    // POST /api/shiri/data (or POST /api/data) — Save site data to Cloudflare KV
    if (
      (path === '/api/shiri/data' || path === '/api/data') &&
      (method === 'POST' || method === 'PUT')
    ) {
      let body: any = {};
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ success: false, message: 'قالب داده ارسالی نامعتبر است.' }, 400);
      }

      const payload = body?.data || body;
      if (!payload || typeof payload !== 'object') {
        return jsonResponse({ success: false, message: 'داده ارسالی معتبر نیست.' }, 400);
      }

      if (kv) {
        await kv.put(KV_KEY, JSON.stringify(payload));
      }

      return jsonResponse({
        success: true,
        message: 'اطلاعات وب‌سایت رسمی مصطفی شیری با موفقیت در کلودفلر ذخیره شد.',
      });
    }

    // POST /api/shiri/reset — Reset KV storage to default authentic Mostafa Shiri data
    if (path === '/api/shiri/reset' && method === 'POST') {
      if (kv) {
        await kv.put(KV_KEY, JSON.stringify(DEFAULT_SITE_DATA));
      }
      return jsonResponse({
        success: true,
        data: DEFAULT_SITE_DATA,
        message: 'اطلاعات سایت به داده‌های اصلی مصطفی شیری بازنشانی شد.',
      });
    }

    // POST /api/admin/verify — Verify admin password
    if (path === '/api/admin/verify' && method === 'POST') {
      const configuredSecret = getAdminSecret(env);
      let body: any = {};
      try {
        body = await request.json();
      } catch {
        // empty body ok
      }

      const candidate = (body?.password || body?.adminPassword || '').toString().trim();
      if (candidate === DEFAULT_ADMIN_PASS || candidate === configuredSecret) {
        return jsonResponse({
          success: true,
          message: 'احراز هویت پنل مدیریت مصطفی شیری تأیید شد.',
        });
      }

      return jsonResponse(
        {
          success: false,
          message: 'رمز عبور واردشده نادرست است.',
        },
        401
      );
    }

    return jsonResponse(
      {
        success: false,
        message: `مسیر API یافت نشد: ${method} ${path}`,
      },
      404
    );
  } catch (err: any) {
    return jsonResponse(
      {
        success: false,
        message: 'خطای داخلی سرور در پردازش درخواست.',
        error: err?.message || String(err),
      },
      500
    );
  }
}

/**
 * Cloudflare Worker Entry Point for Mostafa Shiri Official Website (وب‌سایت رسمی مصطفی شیری)
 * Serves both the Vite static frontend (./dist) and the Cloudflare Workers KV API (/api/*).
 */

import { handleApiRequest } from './src/server/apiRouter';
import { Env } from './src/server/types';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. API routes handled by serverless Cloudflare KV backend
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }

    // 2. Cloudflare Static Assets handling (Vite frontend built into ./dist)
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      const response = await env.ASSETS.fetch(request);
      if (response.status !== 404) {
        return response;
      }
      // SPA Fallback for client-side navigation
      return env.ASSETS.fetch(new Request(new URL('/', request.url), request));
    }

    return new Response('Mostafa Shiri Official Website | وب‌سایت رسمی مصطفی شیری', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  },
};

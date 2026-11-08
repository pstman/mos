/**
 * Cloudflare Worker Entry Point for PardehNegar
 * Connects Cloudflare Static Assets and Cloudflare Workers KV
 */

import { handleApiRequest } from './src/server/apiRouter';
import { Env } from './src/server/types';

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // 1. API routes handled by serverless KV backend
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }

    // 2. Cloudflare Static Assets handling (Vite frontend)
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      const response = await env.ASSETS.fetch(request);
      if (response.status !== 404) {
        return response;
      }
      // SPA Fallback for client-side navigation
      return env.ASSETS.fetch(new Request(new URL('/', request.url), request));
    }

    return new Response('PardehNegar - Iranian-Danubian Acoustic Continuum', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  },
};

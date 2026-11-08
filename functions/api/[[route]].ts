/**
 * Cloudflare Pages Functions Catch-all Router for /api/*
 */

import { handleApiRequest } from '../../src/server/apiRouter';

export async function onRequest(context: any): Promise<Response> {
  return handleApiRequest(context.request, context.env);
}

/**
 * Serverless Cloudflare Workers & Pages KV Environment Types
 * for Mostafa Shiri Official Website (وب‌سایت رسمی مصطفی شیری)
 */

export interface Env {
  /** Primary Cloudflare Workers KV Namespace for Mostafa Shiri site data */
  SHIRI_KV?: any;
  /** Backwards-compatible Cloudflare Workers KV Namespace binding */
  BLOG_KV?: any;
  /** Cloudflare Workers Static Assets binding (./dist) */
  ASSETS?: {
    fetch: (req: Request) => Promise<Response>;
  };
  /** Optional custom admin password secret configured in Cloudflare */
  ADMIN_PASSWORD?: string;
  MODIRIAT_ADMIN?: string;
  VITE_MODIRIAT_ADMIN?: string;
  [key: string]: any;
}

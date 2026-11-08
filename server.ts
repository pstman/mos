/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * سرور فول‌استک پرده‌نگار و پیوستار آکوستیک • استودیو اینامیکس
 * Full-stack Express server with Vite middleware and unified Serverless API integration.
 * Supports local file-backed storage (data/blog_posts.json) and Cloudflare Workers KV.
 */

import express, { Request as ExpressReq, Response as ExpressRes } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleApiRequest } from './src/server/apiRouter';
import { SEED_BLOG_POSTS, SEED_PODCAST_EPISODES } from './src/server/seedData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Body Parser Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Database storage directory & file for local development persistence
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'blog_posts.json');
const PODCASTS_DB_FILE = path.resolve(DATA_DIR, 'podcasts.json');
const SHIRI_DB_FILE = path.resolve(DATA_DIR, 'shiri_site_data.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Local file helpers
function readDbPosts(): any[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading DB_FILE:', err);
  }
  writeDbPosts(SEED_BLOG_POSTS);
  return SEED_BLOG_POSTS;
}

function writeDbPosts(posts: any[]): void {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(posts, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing DB_FILE:', err);
  }
}

function readDbPodcasts(): any[] {
  try {
    if (fs.existsSync(PODCASTS_DB_FILE)) {
      const data = fs.readFileSync(PODCASTS_DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading PODCASTS_DB_FILE:', err);
  }
  writeDbPodcasts(SEED_PODCAST_EPISODES);
  return SEED_PODCAST_EPISODES;
}

function writeDbPodcasts(podcasts: any[]): void {
  try {
    const tempFile = `${PODCASTS_DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(podcasts, null, 2), 'utf-8');
    fs.renameSync(tempFile, PODCASTS_DB_FILE);
  } catch (err) {
    console.error('Error writing PODCASTS_DB_FILE:', err);
  }
}

function readShiriData(): any | null {
  try {
    if (fs.existsSync(SHIRI_DB_FILE)) {
      const raw = fs.readFileSync(SHIRI_DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading SHIRI_DB_FILE:', err);
  }
  return null;
}

function writeShiriData(data: any): void {
  try {
    const tempFile = `${SHIRI_DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, SHIRI_DB_FILE);
  } catch (err) {
    console.error('Error writing SHIRI_DB_FILE:', err);
  }
}

// Local KV Adapter simulating Cloudflare Workers KV for local Express development
const localKvAdapter = {
  async get(key: string, _type?: string): Promise<any> {
    if (key === 'shiri_site_data') {
      return readShiriData();
    }
    if (key === 'blog_posts') {
      return readDbPosts();
    }
    if (key.startsWith('post:')) {
      const id = key.slice(5);
      const posts = readDbPosts();
      return posts.find((p: any) => p.id === id) || null;
    }
    if (key === 'podcasts_list') {
      return readDbPodcasts();
    }
    if (key.startsWith('podcast:')) {
      const id = key.slice(8);
      const podcasts = readDbPodcasts();
      return podcasts.find((p: any) => p.id === id) || null;
    }
    return null;
  },
  async put(key: string, value: string): Promise<void> {
    if (key === 'shiri_site_data') {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        writeShiriData(parsed);
      } catch (err) {
        console.error('Error parsing shiri_site_data in local KV put:', err);
      }
    }
    if (key === 'blog_posts') {
      try {
        const posts = JSON.parse(value);
        writeDbPosts(posts);
      } catch (err) {
        console.error('Error parsing posts in local KV put:', err);
      }
    }
    if (key === 'podcasts_list') {
      try {
        const podcasts = JSON.parse(value);
        writeDbPodcasts(podcasts);
      } catch (err) {
        console.error('Error parsing podcasts in local KV put:', err);
      }
    }
  },
  async delete(key: string): Promise<void> {
    if (key.startsWith('post:')) {
      const id = key.slice(5);
      const posts = readDbPosts();
      writeDbPosts(posts.filter((p: any) => p.id !== id));
    }
    if (key.startsWith('podcast:')) {
      const id = key.slice(8);
      const podcasts = readDbPodcasts();
      writeDbPodcasts(podcasts.filter((p: any) => p.id !== id));
    }
  }
};

// --- Unified API Handler Bridge for Express ---
app.all('/api/*', async (req: ExpressReq, res: ExpressRes) => {
  try {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      }
    }

    const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase());
    const bodyStr = hasBody ? JSON.stringify(req.body) : undefined;

    const webReq = new Request(fullUrl, {
      method: req.method,
      headers,
      body: bodyStr,
    });

    const webRes = await handleApiRequest(webReq, {
      BLOG_KV: localKvAdapter,
      MODIRIAT_ADMIN: process.env.MODIRIAT_ADMIN || process.env.VITE_MODIRIAT_ADMIN,
    });

    res.status(webRes.status);
    webRes.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });

    const resText = await webRes.text();
    res.send(resText);
  } catch (err: any) {
    console.error('[API Bridge Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- STATIC ASSETS & VITE INTEGRATION ---
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: ExpressReq, res: ExpressRes) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PardehNegar] Full-stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[PardehNegar] Failed to start server:', err);
  process.exit(1);
});

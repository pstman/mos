/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * سرور فول‌استک وب‌سایت رسمی مصطفی شیری (Mostafa Shiri Official Website)
 * Full-stack Express server with Vite middleware and unified Cloudflare KV-compatible API.
 */

import express, { Request as ExpressReq, Response as ExpressRes } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleApiRequest } from './src/server/apiRouter';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Body Parser Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Local JSON storage simulating Cloudflare Workers KV in local development
const DATA_DIR = path.resolve(__dirname, 'data');
const SHIRI_DB_FILE = path.resolve(DATA_DIR, 'shiri_site_data.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readShiriData(): any | null {
  try {
    if (fs.existsSync(SHIRI_DB_FILE)) {
      const raw = fs.readFileSync(SHIRI_DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[MostafaShiri] Error reading SHIRI_DB_FILE:', err);
  }
  return null;
}

function writeShiriData(data: any): void {
  try {
    const tempFile = `${SHIRI_DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, SHIRI_DB_FILE);
  } catch (err) {
    console.error('[MostafaShiri] Error writing SHIRI_DB_FILE:', err);
  }
}

// Local KV Adapter matching Cloudflare Workers KV interface
const localKvAdapter = {
  async get(key: string): Promise<any> {
    if (key === 'shiri_site_data') {
      return readShiriData();
    }
    return null;
  },
  async put(key: string, value: string): Promise<void> {
    if (key === 'shiri_site_data') {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        writeShiriData(parsed);
      } catch (err) {
        console.error('[MostafaShiri] Error parsing shiri_site_data in local KV put:', err);
      }
    }
  },
  async delete(key: string): Promise<void> {
    if (key === 'shiri_site_data' && fs.existsSync(SHIRI_DB_FILE)) {
      fs.unlinkSync(SHIRI_DB_FILE);
    }
  },
};

// Unified Serverless API Bridge for Express (/api/*)
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
      SHIRI_KV: localKvAdapter,
      BLOG_KV: localKvAdapter,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || process.env.MODIRIAT_ADMIN,
    });

    res.status(webRes.status);
    webRes.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });

    const resText = await webRes.text();
    res.send(resText);
  } catch (err: any) {
    console.error('[MostafaShiri API Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Static Assets & Vite Integration
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
    console.log(`[Mostafa Shiri Official] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Mostafa Shiri Official] Failed to start server:', err);
  process.exit(1);
});

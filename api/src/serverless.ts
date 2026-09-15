import type { Request, Response } from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import { AppModule } from './app.module';
import { env } from './env';

let cached: Express | null = null;

function corsOriginDelegate(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
  const allowed = env('FRONTEND_URL', 'http://localhost:3000')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  if (!origin) {
    callback(null, true);
    return;
  }
  if (allowed.includes(origin) || /\.vercel\.app$/i.test(origin)) {
    callback(null, true);
    return;
  }
  callback(null, false);
}

async function createExpressApp(): Promise<Express> {
  if (cached) return cached;

  const server = express();
  // Keep Nest body parser off so multer can read multipart uploads on Vercel
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    bodyParser: false,
  });

  app.use(cookieParser());
  // JSON for non-multipart routes only
  app.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      const type = req.headers['content-type'] || '';
      if (typeof type === 'string' && type.includes('multipart/form-data')) {
        next();
        return;
      }
      return express.json({ limit: '2mb' })(req, res, next);
    },
  );
  app.enableCors({
    origin: corsOriginDelegate,
    credentials: true,
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.setGlobalPrefix('api');

  // Root HTML so Analytics / Speed Insights scripts can load on this project
  server.get('/', (_req, res) => {
    res
      .type('html')
      .send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Aureon API</title>
    <script defer src="/_vercel/insights/script.js"></script>
    <script defer src="/_vercel/speed-insights/script.js"></script>
  </head>
  <body style="font-family:system-ui;background:#070b12;color:#f4f7fb;padding:2rem">
    <h1>Aureon API</h1>
    <p>Health: <a href="/api/health" style="color:#4fd1c5">/api/health</a></p>
    <p>Observability page: <a href="/api/observability" style="color:#4fd1c5">/api/observability</a></p>
  </body>
</html>`);
  });

  await app.init();

  cached = server;
  return server;
}

export default async function handler(req: Request, res: Response) {
  const server = await createExpressApp();
  return server(req, res);
}

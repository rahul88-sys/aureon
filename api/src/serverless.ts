import type { Request, Response } from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import { AppModule } from './app.module';
import { env } from './env';

let cached: Express | null = null;

async function createExpressApp(): Promise<Express> {
  if (cached) return cached;

  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    bodyParser: true,
  });

  const frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

  app.use(cookieParser());
  app.enableCors({
    origin: frontendUrl.split(',').map((v) => v.trim()),
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
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

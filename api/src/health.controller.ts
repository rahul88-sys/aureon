import { Controller, Get, Header, Req } from '@nestjs/common';
import type { Request } from 'express';
import { trackApi } from './analytics';

@Controller()
export class HealthController {
  @Get('health')
  async health(@Req() req: Request) {
    void trackApi('api_health', req);
    return {
      ok: true,
      service: 'aureon-api',
      auth: 'google-oauth + jwt',
      analytics: true,
      speedInsights: true,
      time: new Date().toISOString(),
      config: {
        frontend: Boolean(process.env.FRONTEND_URL),
        google: Boolean(process.env.GOOGLE_CLIENT_ID),
        jwt: Boolean(process.env.JWT_SECRET),
        database: Boolean(process.env.DATABASE_URL),
        blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
        pdf: Boolean(process.env.PDF_SERVICE_URL),
      },
    };
  }

  /** Tiny HTML shell so Vercel Analytics + Speed Insights scripts can load on this project. */
  @Get('observability')
  @Header('Content-Type', 'text/html; charset=utf-8')
  observability() {
    return `<!doctype html>
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
    <p>Analytics + Speed Insights are enabled for this deployment.</p>
  </body>
</html>`;
  }
}

import { config } from 'dotenv';

config();

/** Tiny env helper — avoids ESM-only @nestjs/config on Vercel Node. */
export function env(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

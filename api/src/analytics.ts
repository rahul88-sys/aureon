import { track } from '@vercel/analytics/server';
import type { Request } from 'express';

/** Fire-and-forget server analytics (never breaks the API). */
export async function trackApi(
  name: string,
  req?: Request,
  data?: Record<string, string | number | boolean>,
) {
  try {
    await track(name, data, req ? { request: req } : undefined);
  } catch {
    /* ignore analytics failures */
  }
}

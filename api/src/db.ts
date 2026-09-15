import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { env } from './env';

export type ThemePreference = 'signal' | 'modern';

export type DbUser = {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  provider: 'google';
  provider_sub: string;
  theme: ThemePreference;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
};

let sql: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

export function hasDatabase(): boolean {
  return Boolean(env('DATABASE_URL'));
}

export function getSql() {
  const url = env('DATABASE_URL');
  if (!url) {
    throw new Error('DATABASE_URL is not configured');
  }
  if (!sql) {
    sql = neon(url);
  }
  return sql;
}

export async function ensureUsersSchema() {
  if (!hasDatabase()) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = getSql();
      await db`
        CREATE TABLE IF NOT EXISTS users (
          id            TEXT PRIMARY KEY,
          email         TEXT NOT NULL UNIQUE,
          name          TEXT NOT NULL,
          picture       TEXT,
          provider      TEXT NOT NULL CHECK (provider IN ('google')),
          provider_sub  TEXT NOT NULL,
          theme         TEXT NOT NULL DEFAULT 'modern'
                          CHECK (theme IN ('signal', 'modern')),
          created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
          last_login_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE (provider, provider_sub)
        )
      `;
      await db`CREATE INDEX IF NOT EXISTS users_email_idx ON users (email)`;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}

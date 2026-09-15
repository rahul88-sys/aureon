import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  ensureUsersSchema,
  getSql,
  hasDatabase,
  type DbUser,
  type ThemePreference,
} from '../db';
import type { AuthProvider, AuthUser, GoogleProfile } from './auth.types';

function toAuthUser(row: DbUser): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    picture: row.picture || undefined,
    provider: 'google',
    theme: row.theme === 'signal' ? 'signal' : 'modern',
  };
}

@Injectable()
export class UsersService implements OnModuleInit {
  /** Fallback when DATABASE_URL is unset (local / bootstrap). */
  private readonly memory = new Map<string, AuthUser>();

  async onModuleInit() {
    if (!hasDatabase()) {
      console.warn(
        '[users] DATABASE_URL missing — using in-memory users (not durable).',
      );
      return;
    }
    try {
      await ensureUsersSchema();
      console.log('[users] Neon schema ready');
    } catch (err) {
      console.error('[users] Failed to ensure schema', err);
    }
  }

  async upsertOAuth(input: {
    provider: AuthProvider;
    providerSub: string;
    email: string;
    name: string;
    picture?: string;
  }): Promise<AuthUser> {
    const email = input.email.trim().toLowerCase();
    if (!email) {
      throw new Error('OAuth account did not return an email.');
    }
    const id = `${input.provider}_${input.providerSub}`;
    const name = input.name?.trim() || email.split('@')[0];
    const picture = input.picture || null;

    if (!hasDatabase()) {
      const existing = this.memory.get(email);
      const user: AuthUser = {
        id: existing?.id ?? id,
        email,
        name,
        picture: picture || undefined,
        provider: 'google',
        theme: existing?.theme ?? 'modern',
      };
      this.memory.set(email, user);
      this.memory.set(user.id, user);
      return user;
    }

    await ensureUsersSchema();
    const db = getSql();
    const rows = (await db`
      INSERT INTO users (id, email, name, picture, provider, provider_sub, theme, last_login_at, updated_at)
      VALUES (
        ${id},
        ${email},
        ${name},
        ${picture},
        ${input.provider},
        ${input.providerSub},
        'modern',
        now(),
        now()
      )
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        picture = COALESCE(EXCLUDED.picture, users.picture),
        provider = EXCLUDED.provider,
        provider_sub = EXCLUDED.provider_sub,
        last_login_at = now(),
        updated_at = now()
      RETURNING *
    `) as DbUser[];

    const row = rows[0];
    if (!row) throw new Error('Failed to upsert user');
    return toAuthUser(row);
  }

  upsertFromGoogle(profile: GoogleProfile): Promise<AuthUser> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return Promise.reject(new Error('Google account did not return an email.'));
    }
    return this.upsertOAuth({
      provider: 'google',
      providerSub: profile.id,
      email,
      name: profile.displayName ?? email.split('@')[0],
      picture: profile.photos?.[0]?.value,
    });
  }

  async findById(id: string): Promise<AuthUser | undefined> {
    if (!hasDatabase()) {
      return this.memory.get(id);
    }
    await ensureUsersSchema();
    const db = getSql();
    const rows = (await db`
      SELECT * FROM users WHERE id = ${id} LIMIT 1
    `) as DbUser[];
    return rows[0] ? toAuthUser(rows[0]) : undefined;
  }

  async updateTheme(userId: string, theme: ThemePreference): Promise<AuthUser> {
    const next: ThemePreference = theme === 'signal' ? 'signal' : 'modern';
    if (!hasDatabase()) {
      const existing =
        this.memory.get(userId) ||
        [...this.memory.values()].find((u) => u.id === userId);
      if (!existing) throw new Error('User not found');
      const updated = { ...existing, theme: next };
      this.memory.set(updated.email, updated);
      this.memory.set(updated.id, updated);
      return updated;
    }
    await ensureUsersSchema();
    const db = getSql();
    const rows = (await db`
      UPDATE users
      SET theme = ${next}, updated_at = now()
      WHERE id = ${userId}
      RETURNING *
    `) as DbUser[];
    if (!rows[0]) throw new Error('User not found');
    return toAuthUser(rows[0]);
  }
}

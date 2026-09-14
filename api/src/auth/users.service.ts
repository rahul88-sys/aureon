import { Injectable } from '@nestjs/common';
import type { AuthUser, GoogleProfile } from './auth.types';

@Injectable()
export class UsersService {
  private readonly users = new Map<string, AuthUser>();

  upsertFromGoogle(profile: GoogleProfile): AuthUser {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new Error('Google account did not return an email.');
    }

    const existing = this.users.get(email);
    const user: AuthUser = {
      id: existing?.id ?? `google_${profile.id}`,
      email,
      name: profile.displayName ?? email.split('@')[0],
      picture: profile.photos?.[0]?.value,
      provider: 'google',
    };
    this.users.set(email, user);
    return user;
  }

  findById(id: string): AuthUser | undefined {
    for (const user of this.users.values()) {
      if (user.id === id) return user;
    }
    return undefined;
  }
}

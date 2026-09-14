import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from '../env';
import type { AuthUser, GoogleProfile } from './auth.types';
import { UsersService } from './users.service';

export type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  validateGoogleUser(profile: GoogleProfile): AuthUser {
    return this.users.upsertFromGoogle(profile);
  }

  signToken(user: AuthUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    };
    return this.jwt.sign(payload);
  }

  userFromPayload(payload: JwtPayload): AuthUser {
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token');
    }

    const cached = this.users.findById(payload.sub);
    if (cached) return cached;

    const user: AuthUser = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      provider: 'google',
    };
    return user;
  }

  cookieOptions() {
    const isProd = env('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? ('none' as const) : ('lax' as const),
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    };
  }
}

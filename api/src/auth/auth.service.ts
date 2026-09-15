import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from '../env';
import type {
  AuthUser,
  GoogleProfile,
  MicrosoftProfile,
  ThemePreference,
} from './auth.types';
import { UsersService } from './users.service';

export type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google' | 'microsoft';
  theme: ThemePreference;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  validateGoogleUser(profile: GoogleProfile): Promise<AuthUser> {
    return this.users.upsertFromGoogle(profile);
  }

  validateMicrosoftUser(profile: MicrosoftProfile): Promise<AuthUser> {
    return this.users.upsertFromMicrosoft(profile);
  }

  signToken(user: AuthUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      provider: user.provider,
      theme: user.theme || 'modern',
    };
    return this.jwt.sign(payload);
  }

  async userFromPayload(payload: JwtPayload): Promise<AuthUser> {
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token');
    }

    const cached = await this.users.findById(payload.sub);
    if (cached) return cached;

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      provider: payload.provider === 'microsoft' ? 'microsoft' : 'google',
      theme: payload.theme === 'signal' ? 'signal' : 'modern',
    };
  }

  updateTheme(userId: string, theme: ThemePreference) {
    return this.users.updateTheme(userId, theme);
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

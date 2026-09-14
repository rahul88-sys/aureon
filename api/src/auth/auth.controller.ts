import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { trackApi } from '../analytics';
import { env } from '../env';
import { AuthService } from './auth.service';
import type { AuthUser } from './auth.types';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth(@Req() req: Request) {
    void trackApi('auth_google_start', req);
    return { ok: true };
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as AuthUser | undefined;
    if (!user) {
      throw new UnauthorizedException('Google sign-in failed');
    }

    const token = this.auth.signToken(user);
    res.cookie('aureon_token', token, this.auth.cookieOptions());
    await trackApi('auth_google_success', req, { provider: 'google' });

    const frontend = env('FRONTEND_URL', 'http://localhost:3000').split(',')[0];
    return res.redirect(
      `${frontend}/auth/callback#token=${encodeURIComponent(token)}`,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request) {
    void trackApi('auth_me', req);
    return {
      ok: true,
      user: req.user,
    };
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('aureon_token', {
      ...this.auth.cookieOptions(),
      maxAge: 0,
    });
    await trackApi('auth_logout', req);
    return { ok: true };
  }
}

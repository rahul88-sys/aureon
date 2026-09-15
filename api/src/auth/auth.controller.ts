import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { trackApi } from '../analytics';
import { env } from '../env';
import { AuthService } from './auth.service';
import type { AuthUser, ThemePreference } from './auth.types';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { MicrosoftAuthGuard } from './guards/microsoft-auth.guard';
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

  @Get('microsoft')
  @UseGuards(MicrosoftAuthGuard)
  microsoftAuth(@Req() req: Request) {
    void trackApi('auth_microsoft_start', req);
    return { ok: true };
  }

  @Get('microsoft/callback')
  @UseGuards(MicrosoftAuthGuard)
  async microsoftCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as AuthUser | undefined;
    if (!user) {
      throw new UnauthorizedException('Microsoft sign-in failed');
    }

    const token = this.auth.signToken(user);
    res.cookie('aureon_token', token, this.auth.cookieOptions());
    await trackApi('auth_microsoft_success', req, { provider: 'microsoft' });

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

  @Patch('me/theme')
  @UseGuards(JwtAuthGuard)
  async setTheme(
    @Req() req: Request,
    @Body() body: { theme?: string },
  ) {
    const user = req.user as AuthUser;
    const theme = body?.theme;
    if (theme !== 'signal' && theme !== 'modern') {
      throw new BadRequestException('theme must be signal or modern');
    }
    const updated = await this.auth.updateTheme(
      user.id,
      theme as ThemePreference,
    );
    await trackApi('auth_theme_update', req, { theme });
    return {
      ok: true,
      user: updated,
      token: this.auth.signToken(updated),
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

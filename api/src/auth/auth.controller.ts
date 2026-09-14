import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import type { AuthUser } from './auth.types';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    return { ok: true };
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as AuthUser | undefined;
    if (!user) {
      throw new UnauthorizedException('Google sign-in failed');
    }

    const token = this.auth.signToken(user);
    res.cookie('aureon_token', token, this.auth.cookieOptions());

    const frontend =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    return res.redirect(`${frontend}/auth/callback?ok=1`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request) {
    return {
      ok: true,
      user: req.user,
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('aureon_token', {
      ...this.auth.cookieOptions(),
      maxAge: 0,
    });
    return { ok: true };
  }
}

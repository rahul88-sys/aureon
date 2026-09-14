import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { env } from '../../env';
import { AuthService, type JwtPayload } from '../auth.service';

function cookieExtractor(req: Request): string | null {
  if (req?.cookies?.aureon_token) {
    return req.cookies.aureon_token as string;
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly auth: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: env('JWT_SECRET', 'dev-only-change-me'),
    });
  }

  validate(payload: JwtPayload) {
    return this.auth.userFromPayload(payload);
  }
}

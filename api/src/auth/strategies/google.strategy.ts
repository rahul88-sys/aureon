import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { env } from '../../env';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly auth: AuthService) {
    super({
      clientID: env('GOOGLE_CLIENT_ID', 'missing'),
      clientSecret: env('GOOGLE_CLIENT_SECRET', 'missing'),
      callbackURL: env(
        'GOOGLE_CALLBACK_URL',
        'http://localhost:4000/api/auth/google/callback',
      ),
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    try {
      const user = this.auth.validateGoogleUser({
        id: profile.id,
        emails: profile.emails,
        displayName: profile.displayName,
        photos: profile.photos,
      });
      done(null, user);
    } catch (error) {
      done(error as Error, undefined);
    }
  }
}

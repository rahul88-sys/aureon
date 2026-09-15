import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { env } from '../../env';
import { AuthService } from '../auth.service';

type MsProfile = {
  id: string;
  displayName?: string;
  emails?: Array<{ value: string }>;
  userPrincipalName?: string;
  _json?: {
    mail?: string;
    userPrincipalName?: string;
    displayName?: string;
  };
};

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(private readonly auth: AuthService) {
    super({
      clientID: env('MICROSOFT_CLIENT_ID', 'missing'),
      clientSecret: env('MICROSOFT_CLIENT_SECRET', 'missing'),
      callbackURL: env(
        'MICROSOFT_CALLBACK_URL',
        'http://localhost:4000/api/auth/microsoft/callback',
      ),
      scope: ['user.read'],
      tenant: env('MICROSOFT_TENANT', 'common'),
    } as ConstructorParameters<typeof Strategy>[0]);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: MsProfile,
    done: (error: Error | null, user?: Express.User) => void,
  ) {
    try {
      const user = await this.auth.validateMicrosoftUser(profile);
      done(null, user);
    } catch (error) {
      done(error as Error, undefined);
    }
  }
}

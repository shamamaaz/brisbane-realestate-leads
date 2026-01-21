import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.FACEBOOK_APP_ID || '',
      clientSecret: process.env.FACEBOOK_APP_SECRET || '',
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/api/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'displayName'],
      scope: ['email'],
    });
  }

  async validate(_: string, __: string, profile: Profile) {
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName || email || 'Facebook User';
    return this.authService.loginOAuth({ email, name, provider: 'facebook' });
  }
}

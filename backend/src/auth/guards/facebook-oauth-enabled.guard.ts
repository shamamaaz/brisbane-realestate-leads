import { CanActivate, Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class FacebookOAuthEnabledGuard implements CanActivate {
  canActivate(): boolean {
    if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
      throw new ServiceUnavailableException('Facebook OAuth is not configured.');
    }
    return true;
  }
}

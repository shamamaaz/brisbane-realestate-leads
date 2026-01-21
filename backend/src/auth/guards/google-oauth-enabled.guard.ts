import { CanActivate, Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class GoogleOAuthEnabledGuard implements CanActivate {
  canActivate(): boolean {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new ServiceUnavailableException('Google OAuth is not configured.');
    }
    return true;
  }
}

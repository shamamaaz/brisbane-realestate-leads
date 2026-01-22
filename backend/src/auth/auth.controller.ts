import { Body, Controller, Get, Post, Query, Request, UseGuards, ForbiddenException, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SellerMagicLinkDto } from './dto/seller-magic-link.dto';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { FacebookOAuthEnabledGuard } from './guards/facebook-oauth-enabled.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GoogleOAuthEnabledGuard } from './guards/google-oauth-enabled.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('seller/magic-link')
  async createSellerMagicLink(@Body() dto: SellerMagicLinkDto) {
    return this.authService.createSellerMagicLink(dto.email);
  }

  @Get('seller/verify')
  async verifySellerMagicLink(@Query('token') token: string): Promise<AuthResponseDto> {
    return this.authService.verifySellerMagicLink(token);
  }

  @Get('google')
  @UseGuards(GoogleOAuthEnabledGuard, GoogleAuthGuard)
  async googleAuth() {
    return { status: 'OK' };
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthEnabledGuard, GoogleAuthGuard)
  async googleCallback(@Request() req: any, @Res() res: Response) {
    const payload = req.user as AuthResponseDto;
    return this.redirectToApp(res, payload);
  }

  @Get('facebook')
  @UseGuards(FacebookOAuthEnabledGuard, FacebookAuthGuard)
  async facebookAuth() {
    return { status: 'OK' };
  }

  @Get('facebook/callback')
  @UseGuards(FacebookOAuthEnabledGuard, FacebookAuthGuard)
  async facebookCallback(@Request() req: any, @Res() res: Response) {
    const payload = req.user as AuthResponseDto;
    return this.redirectToApp(res, payload);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req: any): Promise<any> {
    return this.authService.getUserById(req.user.id);
  }

  @Post('seed-demo')
  async seedDemo() {
    if (process.env.ENABLE_DEMO_SEED !== 'true') {
      throw new ForbiddenException('Demo seed is disabled. Set ENABLE_DEMO_SEED=true to enable.');
    }
    return this.authService.seedDemoData();
  }

  private redirectToApp(res: Response, payload: AuthResponseDto) {
    const webAppUrl = process.env.WEB_APP_URL || 'http://localhost:4200';
    const redirectUrl = new URL('/auth/callback', webAppUrl);
    redirectUrl.searchParams.set('token', payload.accessToken);
    redirectUrl.searchParams.set('role', payload.role);
    redirectUrl.searchParams.set('email', payload.email);
    redirectUrl.searchParams.set('name', payload.name || '');
    return res.redirect(redirectUrl.toString());
  }
}

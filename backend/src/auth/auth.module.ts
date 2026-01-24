import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getJwtConfig } from '../config/jwt.config';
import { Agency } from '../agencies/entities/agency.entity';
import { Agent } from '../agents/entities/agent.entity';
import { Lead } from '../leads/entities/lead.entity';
import { EmailModule } from '../shared/email/email.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SellerLoginToken } from './entities/seller-login-token.entity';
import { User } from './entities/user.entity';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Lead, Agency, Agent, SellerLoginToken]),
    EmailModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: getJwtConfig,
    }),
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy, FacebookStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

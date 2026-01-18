import { JwtModuleOptions } from '@nestjs/jwt';
import { StringValue } from '@nestjs/common';

export const getJwtConfig = (): JwtModuleOptions => {
  return {
    secret: process.env.JWT_SECRET || 'your_super_secret_key_change_in_production',
    signOptions: {
      expiresIn: (process.env.JWT_EXPIRATION || '7d') as StringValue,
    },
  };
};

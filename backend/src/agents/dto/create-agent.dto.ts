import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  territory?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  sendInvite?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  agencyId?: number;
}

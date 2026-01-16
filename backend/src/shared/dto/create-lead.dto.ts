import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phone: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  territoryId?: number;

  @IsOptional()
  @IsString()
  agencyId?: number;
}

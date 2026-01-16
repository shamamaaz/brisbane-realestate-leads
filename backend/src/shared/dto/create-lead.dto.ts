import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  homeownerName: string;

  @IsEmail()
  homeownerEmail: string;

  @IsPhoneNumber('AU')
  homeownerPhone: string;

  @IsString()
  propertyAddress: string;

  @IsString()
  @IsOptional()
  propertyType?: string; // house, apartment, unit, etc.

  @IsString()
  @IsOptional()
  preferredAgency?: string;

  @IsString()
  @IsOptional()
  preferredContactTime?: string; // e.g., "Evenings 5-8pm"

  @IsOptional()
  territoryId?: number;

  @IsOptional()
  agencyId?: number;
}

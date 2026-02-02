import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  homeownerName: string;

  @IsEmail()
  @IsNotEmpty()
  homeownerEmail: string;

  @IsString()
  @IsNotEmpty()
  homeownerPhone: string;

  @IsString()
  @IsNotEmpty()
  propertyAddress: string;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsString()
  preferredAgency?: string;

  @IsOptional()
  @IsString()
  preferredContactTime?: string;

  @IsOptional()
  @IsString()
  streetAddress?: string;

  @IsOptional()
  @IsString()
  suburb?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postcode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  addressPlaceId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  territoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  agencyId?: number;

  @IsOptional()
  @IsString()
  sourceType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  createdByAgentId?: number;
}

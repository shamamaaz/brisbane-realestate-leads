import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAgentOfferDto {
  @Type(() => Number)
  @IsNumber()
  leadId: number;

  @IsString()
  @IsNotEmpty()
  agentName: string;

  @IsOptional()
  @IsString()
  agentEmail?: string;

  @IsOptional()
  @IsString()
  agencyName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  commissionPercent?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estimatedDays?: number;

  @IsOptional()
  @IsString()
  message?: string;
}

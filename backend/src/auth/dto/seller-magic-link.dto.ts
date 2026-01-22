import { IsEmail } from 'class-validator';

export class SellerMagicLinkDto {
  @IsEmail()
  email: string;
}

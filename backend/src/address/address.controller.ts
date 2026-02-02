import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { AddressService } from './address.service';

@Controller('api/address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query || query.trim().length < 3) {
      throw new BadRequestException('Query must be at least 3 characters');
    }
    return this.addressService.search(query.trim());
  }
}

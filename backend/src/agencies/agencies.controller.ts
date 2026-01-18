import { Controller, Get, Query } from '@nestjs/common';
import { AgenciesService } from './agencies.service';

@Controller('api/agencies')
export class AgenciesController {
  constructor(private readonly agenciesService: AgenciesService) {}

  @Get()
  getAllAgencies() {
    return this.agenciesService.getAllAgencies();
  }

  @Get('lookup')
  lookupByPostcode(@Query('postcode') postcode: string) {
    if (!postcode) {
      return {
        success: false,
        message: 'Postcode is required',
        agencies: []
      };
    }

    const agencies = this.agenciesService.findAgenciesByPostcode(postcode);
    
    if (agencies.length === 0) {
      // If no exact match, return nearest agency
      return {
        success: true,
        message: 'No agencies found for this postcode, suggesting nearby agency',
        agencies: [this.agenciesService.findNearestAgency()],
        exact: false
      };
    }

    return {
      success: true,
      message: 'Agencies found for this postcode',
      agencies: agencies,
      exact: true
    };
  }
}

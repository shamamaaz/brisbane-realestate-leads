import { Body, Controller, Get, Param, Patch, Query, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../auth/entities/user.entity';
import { AgenciesService } from './agencies.service';

@Controller('api/agencies')
export class AgenciesController {
  constructor(private readonly agenciesService: AgenciesService) {}

  @Get()
  getAllAgencies() {
    return this.agenciesService.getAllAgencies();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyAgency(@Request() req: any) {
    if (!req.user?.agencyId) {
      throw new ForbiddenException('Agency not found');
    }
    return this.agenciesService.getAgencyById(req.user.agencyId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateAgency(
    @Request() req: any,
    @Param('id') id: number,
    @Body() payload: any,
  ) {
    if (req.user.role === UserRole.AGENCY_ADMIN && Number(id) !== req.user.agencyId) {
      throw new ForbiddenException('Access denied');
    }
    return this.agenciesService.updateAgency(Number(id), payload);
  }

  @Get('lookup')
  async lookupByPostcode(@Query('postcode') postcode: string) {
    if (!postcode) {
      return {
        success: false,
        message: 'Postcode is required',
        agencies: []
      };
    }

    const agencies = await this.agenciesService.findAgenciesByPostcode(postcode);
    
    if (agencies.length === 0) {
      // If no exact match, return nearest agency
      return {
        success: true,
        message: 'No agencies found for this postcode, suggesting nearby agency',
        agencies: [await this.agenciesService.findNearestAgency()],
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

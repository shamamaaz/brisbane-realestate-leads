import { Body, Controller, ForbiddenException, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAgentOfferDto } from './dto/create-agent-offer.dto';
import { AgentOffersService } from './agent-offers.service';

@Controller('api/offers')
export class AgentOffersController {
  constructor(private readonly offersService: AgentOffersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOffer(@Request() req: any, @Body() dto: CreateAgentOfferDto) {
    const role = req.user?.role;
    if (role !== 'agent' && role !== 'agency_admin') {
      throw new ForbiddenException('Only agents can submit offers');
    }
    return this.offersService.createOffer(dto);
  }

  @Get('lead/:leadId')
  @UseGuards(JwtAuthGuard)
  async getOffersByLead(@Param('leadId') leadId: number) {
    return this.offersService.getOffersByLead(Number(leadId));
  }
}

// leads.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { Lead } from './entities/lead.entity';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  createLead(@Body() leadData: Partial<Lead>): Promise<Lead> {
    return this.leadsService.createLead(leadData);
  }
}

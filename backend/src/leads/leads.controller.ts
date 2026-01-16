import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateLeadDto } from '../shared/dto/create-lead.dto';
import { Lead } from './entities/lead.entity';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  async createLead(@Body() createLeadDto: CreateLeadDto): Promise<Lead> {
    return this.leadsService.createLead(createLeadDto);
  }

  @Get()
  async getAllLeads(
    @Query('status') status?: string,
    @Query('propertyType') propertyType?: string,
  ): Promise<Lead[]> {
    return this.leadsService.getAllLeads(status, propertyType);
  }

  @Get(':id')
  async getLeadById(@Param('id') id: number): Promise<Lead> {
    return this.leadsService.getLeadById(id);
  }

  @Put(':id')
  async updateLead(
    @Param('id') id: number,
    @Body() updateLeadDto: Partial<CreateLeadDto>,
  ): Promise<Lead> {
    return this.leadsService.updateLead(id, updateLeadDto);
  }

  @Post(':id/status')
  async updateLeadStatus(
    @Param('id') id: number,
    @Body() statusUpdateDto: { status: string },
  ): Promise<Lead> {
    return this.leadsService.updateLeadStatus(id, statusUpdateDto.status);
  }

  @Delete(':id')
  async deleteLead(@Param('id') id: number): Promise<void> {
    return this.leadsService.deleteLead(id);
  }
}

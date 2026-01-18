import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddLeadNoteDto } from '../shared/dto/add-lead-note.dto';
import { CreateLeadDto } from '../shared/dto/create-lead.dto';
import { UpdateLeadStatusDto } from '../shared/dto/update-lead-status.dto';
import { Lead } from './entities/lead.entity';
import { LeadsService } from './leads.service';

@Controller('api/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * Health check endpoint (no auth required)
   */
  @Get('health')
  async health(): Promise<{ status: string }> {
    return { status: 'OK' };
  }

  /**
   * Create a new lead (public endpoint - no auth required)
   * The frontend will auto-register/login as part of lead submission
   */
  @Post()
  async createLead(@Body() createLeadDto: CreateLeadDto): Promise<Lead> {
    return this.leadsService.createLead(createLeadDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllLeads(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('propertyType') propertyType?: string,
  ): Promise<Lead[]> {
    return this.leadsService.getAllLeads(status, propertyType);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getLeadById(@Param('id') id: number): Promise<Lead> {
    return this.leadsService.getLeadById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateLead(
    @Param('id') id: number,
    @Body() updateLeadDto: Partial<CreateLeadDto>,
  ): Promise<Lead> {
    return this.leadsService.updateLead(id, updateLeadDto);
  }

  @Post(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateLeadStatus(
    @Param('id') id: number,
    @Body() updateStatusDto: UpdateLeadStatusDto,
  ): Promise<Lead> {
    return this.leadsService.updateLeadStatus(id, updateStatusDto);
  }

  @Post(':id/notes')
  @UseGuards(JwtAuthGuard)
  async addNoteToLead(
    @Param('id') id: number,
    @Body() addNoteDto: AddLeadNoteDto,
  ): Promise<Lead> {
    return this.leadsService.addNoteToLead(id, addNoteDto);
  }

  @Get(':id/call-history')
  @UseGuards(JwtAuthGuard)
  async getCallHistory(@Param('id') id: number): Promise<string[]> {
    return this.leadsService.getCallHistory(id);
  }

  @Post(':id/schedule-followup')
  @UseGuards(JwtAuthGuard)
  async scheduleFollowUp(
    @Param('id') id: number,
    @Body() scheduleDto: { followUpDate: Date; notes: string },
  ): Promise<Lead> {
    return this.leadsService.scheduleFollowUp(
      id,
      new Date(scheduleDto.followUpDate),
      scheduleDto.notes,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteLead(@Param('id') id: number): Promise<void> {
    return this.leadsService.deleteLead(id);
  }
}

import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, Param, Post, Put, Query, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../auth/entities/user.entity';
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

  /**
   * Legacy/alternate route for appraisal requests
   */
  @Post('appraisal-request')
  async createAppraisalLead(@Body() createLeadDto: CreateLeadDto): Promise<Lead> {
    return this.leadsService.createLead(createLeadDto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async bulkUpload(
    @Request() req: any,
    @UploadedFile() file?: { buffer?: Buffer },
  ): Promise<{ successCount: number; errorCount: number; errors: Array<{ row: number; message: string }> }> {
    const role = req.user?.role;
    if (role !== UserRole.AGENCY_ADMIN && role !== UserRole.SYSTEM_ADMIN && role !== UserRole.AGENT) {
      throw new ForbiddenException('Only agency, agent, or admin users can upload leads.');
    }

    if (!file) {
      throw new BadRequestException('CSV file is required.');
    }

    const csv = file.buffer?.toString('utf-8') || '';
    if (!csv.trim()) {
      throw new BadRequestException('CSV file is empty.');
    }

    const sourceType = role === UserRole.AGENT ? 'agent_created' : 'agency_upload';
    return this.leadsService.bulkCreateFromCsv(csv, {
      agencyId: req.user?.agencyId,
      createdByAgentId: role === UserRole.AGENT ? req.user?.id : undefined,
      sourceType,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllLeads(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('propertyType') propertyType?: string,
  ): Promise<Lead[]> {
    return this.leadsService.getAllLeads(req.user, status, propertyType);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async getMyLeads(@Request() req: any): Promise<Lead[]> {
    return this.leadsService.getLeadsByEmail(req.user?.email);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getLeadById(@Request() req: any, @Param('id') id: number): Promise<Lead> {
    return this.leadsService.getLeadById(id, req.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateLead(
    @Request() req: any,
    @Param('id') id: number,
    @Body() updateLeadDto: Partial<CreateLeadDto>,
  ): Promise<Lead> {
    return this.leadsService.updateLead(id, updateLeadDto, req.user);
  }

  @Post(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateLeadStatus(
    @Request() req: any,
    @Param('id') id: number,
    @Body() updateStatusDto: UpdateLeadStatusDto,
  ): Promise<Lead> {
    return this.leadsService.updateLeadStatus(id, updateStatusDto, req.user);
  }

  @Post(':id/assign')
  @UseGuards(JwtAuthGuard)
  async assignLead(
    @Request() req: any,
    @Param('id') id: number,
    @Body() payload: { agentId: number; agentName?: string },
  ): Promise<Lead> {
    return this.leadsService.assignLeadToAgent(id, payload.agentId, payload.agentName, req.user);
  }

  @Post(':id/notes')
  @UseGuards(JwtAuthGuard)
  async addNoteToLead(
    @Request() req: any,
    @Param('id') id: number,
    @Body() addNoteDto: AddLeadNoteDto,
  ): Promise<Lead> {
    return this.leadsService.addNoteToLead(id, addNoteDto, req.user);
  }

  @Get(':id/call-history')
  @UseGuards(JwtAuthGuard)
  async getCallHistory(@Request() req: any, @Param('id') id: number): Promise<string[]> {
    return this.leadsService.getCallHistory(id, req.user);
  }

  @Post(':id/schedule-followup')
  @UseGuards(JwtAuthGuard)
  async scheduleFollowUp(
    @Request() req: any,
    @Param('id') id: number,
    @Body() scheduleDto: { followUpDate: Date; notes: string },
  ): Promise<Lead> {
    return this.leadsService.scheduleFollowUp(
      id,
      new Date(scheduleDto.followUpDate),
      scheduleDto.notes,
      req.user,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteLead(@Request() req: any, @Param('id') id: number): Promise<void> {
    return this.leadsService.deleteLead(id, req.user);
  }
}

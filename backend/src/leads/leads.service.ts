import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../agents/entities/agent.entity';
import { Agency } from '../agencies/entities/agency.entity';
import { UserRole } from '../auth/entities/user.entity';
import { User } from '../auth/entities/user.entity';
import { LeadAssignmentsService } from '../lead-assignments/lead-assignments.service';
import { AddLeadNoteDto } from '../shared/dto/add-lead-note.dto';
import { CreateLeadDto } from '../shared/dto/create-lead.dto';
import { UpdateLeadStatusDto } from '../shared/dto/update-lead-status.dto';
import { Lead } from './entities/lead.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Agent)
    private readonly agentRepo: Repository<Agent>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Agency)
    private readonly agencyRepo: Repository<Agency>,
    private readonly leadAssignmentService: LeadAssignmentsService,
  ) {}

  async createLead(createLeadDto: CreateLeadDto): Promise<Lead> {
    const postcodeMatch = createLeadDto.propertyAddress?.match(/\b\d{4}\b/);
    const resolvedPostcode = createLeadDto.postcode || (postcodeMatch ? postcodeMatch[0] : undefined);
    const lead = this.leadRepo.create({
      ...createLeadDto,
      postcode: resolvedPostcode,
      status: 'New', // Default status for new leads
      sourceType: createLeadDto.sourceType || 'public',
      createdAt: new Date(),
      updatedAt: new Date(),
      callHistory: [],
    });

    const savedLead = await this.leadRepo.save(lead);
    console.log('New lead received:', savedLead);

    const shouldAssign = savedLead.sourceType !== 'public' || !!savedLead.agencyId;
    if (shouldAssign) {
      try {
        await this.leadAssignmentService.assignLeadToAgents(savedLead);
      } catch (error) {
        console.warn('Lead assignment failed, but lead was created:', error);
      }
    }

    return savedLead;
  }

  async getAllLeads(user: any, status?: string, propertyType?: string): Promise<Lead[]> {
    const query = this.leadRepo.createQueryBuilder('lead')
      .leftJoinAndSelect('lead.agency', 'agency')
      .leftJoinAndSelect('lead.territory', 'territory')
      .leftJoinAndSelect('lead.offers', 'offers')
      .orderBy('lead.createdAt', 'DESC');

    let agentRecordId: number | undefined;
    let agencyPostcodes: string[] | undefined;
    if (user?.role === UserRole.AGENT) {
      const agentRecord = await this.agentRepo.findOne({ where: { email: user.email } });
      agentRecordId = agentRecord?.id;
      if (user.agencyId) {
        const agency = await this.agencyRepo.findOne({ where: { id: user.agencyId } });
        agencyPostcodes = agency?.postcodes || [];
      }
    } else if (user?.agencyId) {
      const agency = await this.agencyRepo.findOne({ where: { id: user.agencyId } });
      agencyPostcodes = agency?.postcodes || [];
    }

    this.applyVisibilityFilter(query, user, agentRecordId, agencyPostcodes);

    if (status) {
      query.andWhere('lead.status = :status', { status });
    }

    if (propertyType) {
      query.andWhere('lead.propertyType = :propertyType', { propertyType });
    }

    return query.getMany();
  }

  async getLeadsByEmail(email?: string): Promise<Lead[]> {
    if (!email) {
      return [];
    }

    return this.leadRepo.find({
      where: { homeownerEmail: email },
      relations: ['agency', 'territory', 'offers'],
      order: { createdAt: 'DESC' },
    });
  }

  async getLeadById(id: number, user?: any): Promise<Lead> {
    const lead = await this.leadRepo.findOne({
      where: { id },
      relations: ['agency', 'territory', 'offers'],
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    if (user) {
      let agentRecordId: number | undefined;
      let agencyPostcodes: string[] | undefined;
      if (user.role === UserRole.AGENT) {
        const agentRecord = await this.agentRepo.findOne({ where: { email: user.email } });
        agentRecordId = agentRecord?.id;
        if (user.agencyId) {
          const agency = await this.agencyRepo.findOne({ where: { id: user.agencyId } });
          agencyPostcodes = agency?.postcodes || [];
        }
      } else if (user.agencyId) {
        const agency = await this.agencyRepo.findOne({ where: { id: user.agencyId } });
        agencyPostcodes = agency?.postcodes || [];
      }
      this.ensureLeadAccess(lead, user, agentRecordId, agencyPostcodes);
    }

    return lead;
  }

  async updateLead(
    id: number,
    updateLeadDto: Partial<CreateLeadDto>,
    user?: any,
  ): Promise<Lead> {
    const lead = await this.getLeadById(id, user);
    Object.assign(lead, updateLeadDto, { updatedAt: new Date() });
    return this.leadRepo.save(lead);
  }

  async updateLeadStatus(
    id: number,
    updateStatusDto: UpdateLeadStatusDto,
    user?: any,
  ): Promise<Lead> {
    const validStatuses = ['New', 'Contacted', 'Scheduled', 'Closed'];
    if (!validStatuses.includes(updateStatusDto.status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const lead = await this.getLeadById(id, user);
    lead.status = updateStatusDto.status;
    lead.lastContactedDate = new Date();
    lead.updatedAt = new Date();

    // Update optional fields
    if (updateStatusDto.notes) {
      lead.notes = updateStatusDto.notes;
    }

    if (updateStatusDto.nextFollowUpDate) {
      lead.nextFollowUpDate = updateStatusDto.nextFollowUpDate;
    }

    if (updateStatusDto.assignedAgentName) {
      lead.assignedAgentName = updateStatusDto.assignedAgentName;
    }

    return this.leadRepo.save(lead);
  }

  async assignLeadToAgent(id: number, agentId: number, agentName: string | undefined, user: any): Promise<Lead> {
    if (user.role !== UserRole.AGENCY_ADMIN && user.role !== UserRole.SYSTEM_ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    const lead = await this.getLeadById(id, user);
    if (user.role === UserRole.AGENCY_ADMIN) {
      if (lead.agencyId && lead.agencyId !== user.agencyId) {
        throw new ForbiddenException('Access denied');
      }
      if (!lead.agencyId) {
        const agency = await this.agencyRepo.findOne({ where: { id: user.agencyId } });
        const postcodes = agency?.postcodes || [];
        if (!lead.postcode || !postcodes.includes(lead.postcode)) {
          throw new ForbiddenException('Access denied');
        }
        lead.agencyId = user.agencyId;
        if (agency) {
          lead.agency = agency;
        }
      }
    }

    const matchedUser = await this.userRepo.findOne({ where: { id: agentId } });
    if (matchedUser) {
      const agentRecord = await this.agentRepo.findOne({ where: { email: matchedUser.email } });
    lead.assignedAgentId = matchedUser.id;
    lead.assignedAgentName = agentName || agentRecord?.name || lead.assignedAgentName || '';
    lead.updatedAt = new Date();
      return this.leadRepo.save(lead);
    }

    const agentRecord = await this.agentRepo.findOne({ where: { id: agentId } });
    if (!agentRecord) {
      throw new NotFoundException('Agent not found');
    }

    lead.assignedAgentId = agentRecord.userId || agentRecord.id;
    lead.assignedAgentName = agentName || agentRecord.name || lead.assignedAgentName || '';
    lead.updatedAt = new Date();
    return this.leadRepo.save(lead);
  }

  /**
   * Add a note/comment to a lead with timestamp
   */
  async addNoteToLead(id: number, addNoteDto: AddLeadNoteDto, user?: any): Promise<Lead> {
    const lead = await this.getLeadById(id, user);
    
    const timestamp = new Date().toISOString();
    const noteEntry = `[${timestamp}] ${addNoteDto.note}`;
    
    if (!lead.callHistory) {
      lead.callHistory = [];
    }
    
    lead.callHistory.push(noteEntry);
    lead.updatedAt = new Date();
    
    return this.leadRepo.save(lead);
  }

  /**
   * Get call history for a lead
   */
  async getCallHistory(id: number, user?: any): Promise<string[]> {
    const lead = await this.getLeadById(id, user);
    return lead.callHistory || [];
  }

  /**
   * Schedule follow-up for a lead
   */
  async scheduleFollowUp(
    id: number,
    followUpDate: Date,
    notes: string,
    user?: any,
  ): Promise<Lead> {
    const lead = await this.getLeadById(id, user);
    lead.nextFollowUpDate = followUpDate;
    lead.status = 'Scheduled';
    lead.followUpNotes = notes || '';
    
    await this.addNoteToLead(id, { note: `Follow-up scheduled: ${notes}` }, user);
    
    return this.leadRepo.save(lead);
  }

  async deleteLead(id: number, user?: any): Promise<void> {
    const lead = await this.getLeadById(id, user);
    await this.leadRepo.remove(lead);
  }

  async bulkCreateFromCsv(
    csvContent: string,
    context: { agencyId?: number; createdByAgentId?: number; sourceType: string },
  ): Promise<{
    successCount: number;
    errorCount: number;
    errors: Array<{ row: number; message: string }>;
  }> {
    const rows = this.parseCsv(csvContent);
    if (rows.length === 0) {
      return { successCount: 0, errorCount: 0, errors: [] };
    }

    const [header, ...dataRows] = rows;
    const headerIndex = header.reduce((acc, value, index) => {
      acc[value.trim()] = index;
      return acc;
    }, {} as Record<string, number>);

    const requiredColumns = [
      'homeownerName',
      'homeownerEmail',
      'homeownerPhone',
      'propertyAddress',
      'propertyType',
    ];

    const missingRequired = requiredColumns.filter((col) => headerIndex[col] === undefined);
    if (missingRequired.length) {
      return {
        successCount: 0,
        errorCount: dataRows.length,
        errors: [
          {
            row: 1,
            message: `Missing required columns: ${missingRequired.join(', ')}`,
          },
        ],
      };
    }

    let successCount = 0;
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 0; i < dataRows.length; i += 1) {
      const row = dataRows[i];
      const rowNumber = i + 2;

      const leadData: CreateLeadDto = {
        homeownerName: row[headerIndex.homeownerName]?.trim() || '',
        homeownerEmail: row[headerIndex.homeownerEmail]?.trim() || '',
        homeownerPhone: row[headerIndex.homeownerPhone]?.trim() || '',
        propertyAddress: row[headerIndex.propertyAddress]?.trim() || '',
        propertyType: row[headerIndex.propertyType]?.trim() || '',
        preferredAgency: row[headerIndex.preferredAgency]?.trim() || undefined,
        preferredContactTime: row[headerIndex.preferredContactTime]?.trim() || undefined,
        agencyId: context.agencyId,
        createdByAgentId: context.createdByAgentId,
        sourceType: context.sourceType,
      };

      if (
        !leadData.homeownerName ||
        !leadData.homeownerEmail ||
        !leadData.homeownerPhone ||
        !leadData.propertyAddress ||
        !leadData.propertyType
      ) {
        errors.push({ row: rowNumber, message: 'Missing required values.' });
        continue;
      }

      try {
        await this.createLead(leadData);
        successCount += 1;
      } catch (error) {
        errors.push({ row: rowNumber, message: 'Failed to create lead.' });
      }
    }

    return {
      successCount,
      errorCount: errors.length,
      errors,
    };
  }

  private parseCsv(csvContent: string): string[][] {
    const lines = csvContent.split(/\r?\n/).filter((line) => line.trim() !== '');
    return lines.map((line) => this.parseCsvLine(line));
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
        continue;
      }

      current += char;
    }

    values.push(current);
    return values;
  }

  private applyVisibilityFilter(
    query: any,
    user: any,
    agentRecordId?: number,
    agencyPostcodes: string[] = [],
  ) {
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role === UserRole.SYSTEM_ADMIN) {
      return;
    }

    if (user.role === UserRole.AGENCY_ADMIN) {
      if (agencyPostcodes.length) {
        query.andWhere(
          '(lead.agencyId = :agencyId OR (lead.agencyId IS NULL AND lead.sourceType = :publicSource AND lead.postcode IN (:...postcodes)))',
          { agencyId: user.agencyId || 0, publicSource: 'public', postcodes: agencyPostcodes },
        );
      } else {
        query.andWhere('lead.agencyId = :agencyId', { agencyId: user.agencyId || 0 });
      }
      return;
    }

    if (user.role === UserRole.AGENT) {
      const agentIds = [user.id];
      if (agentRecordId && agentRecordId !== user.id) {
        agentIds.push(agentRecordId);
      }
      query.andWhere('(lead.assignedAgentId IN (:...agentIds) OR lead.createdByAgentId = :agentUserId)', {
        agentIds,
        agentUserId: user.id,
      });
      return;
    }

    throw new ForbiddenException('Access denied');
  }

  private ensureLeadAccess(
    lead: Lead,
    user: any,
    agentRecordId?: number,
    agencyPostcodes: string[] = [],
  ) {
    if (user.role === UserRole.SYSTEM_ADMIN) {
      return;
    }

    if (user.role === UserRole.AGENCY_ADMIN && lead.agencyId === user.agencyId) {
      return;
    }

    if (
      user.role === UserRole.AGENCY_ADMIN &&
      !lead.agencyId &&
      lead.sourceType === 'public' &&
      lead.postcode &&
      agencyPostcodes.includes(lead.postcode)
    ) {
      return;
    }

    if (user.role === UserRole.AGENT) {
      if (lead.createdByAgentId === user.id) {
        return;
      }
      if (lead.assignedAgentId && lead.assignedAgentId === user.id) {
        return;
      }
      if (agentRecordId && lead.assignedAgentId && lead.assignedAgentId === agentRecordId) {
        return;
      }
    }

    throw new ForbiddenException('Access denied');
  }
}

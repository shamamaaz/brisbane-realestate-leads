import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    private readonly leadAssignmentService: LeadAssignmentsService,
  ) {}

  async createLead(createLeadDto: CreateLeadDto): Promise<Lead> {
    const lead = this.leadRepo.create({
      ...createLeadDto,
      status: 'New', // Default status for new leads
      createdAt: new Date(),
      updatedAt: new Date(),
      callHistory: [],
    });

    const savedLead = await this.leadRepo.save(lead);
    console.log('New lead received:', savedLead);

    // Auto-assign the lead
    try {
      await this.leadAssignmentService.assignLeadToAgents(savedLead);
    } catch (error) {
      console.warn('Lead assignment failed, but lead was created:', error);
    }

    return savedLead;
  }

  async getAllLeads(status?: string, propertyType?: string): Promise<Lead[]> {
    const query = this.leadRepo.createQueryBuilder('lead')
      .leftJoinAndSelect('lead.agency', 'agency')
      .leftJoinAndSelect('lead.territory', 'territory')
      .leftJoinAndSelect('lead.offers', 'offers')
      .orderBy('lead.createdAt', 'DESC');

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

  async getLeadById(id: number): Promise<Lead> {
    const lead = await this.leadRepo.findOne({
      where: { id },
      relations: ['agency', 'territory', 'offers'],
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async updateLead(
    id: number,
    updateLeadDto: Partial<CreateLeadDto>,
  ): Promise<Lead> {
    const lead = await this.getLeadById(id);
    Object.assign(lead, updateLeadDto, { updatedAt: new Date() });
    return this.leadRepo.save(lead);
  }

  async updateLeadStatus(
    id: number,
    updateStatusDto: UpdateLeadStatusDto,
  ): Promise<Lead> {
    const validStatuses = ['New', 'Contacted', 'Scheduled', 'Closed'];
    if (!validStatuses.includes(updateStatusDto.status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const lead = await this.getLeadById(id);
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

  /**
   * Add a note/comment to a lead with timestamp
   */
  async addNoteToLead(id: number, addNoteDto: AddLeadNoteDto): Promise<Lead> {
    const lead = await this.getLeadById(id);
    
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
  async getCallHistory(id: number): Promise<string[]> {
    const lead = await this.getLeadById(id);
    return lead.callHistory || [];
  }

  /**
   * Schedule follow-up for a lead
   */
  async scheduleFollowUp(
    id: number,
    followUpDate: Date,
    notes: string,
  ): Promise<Lead> {
    const lead = await this.getLeadById(id);
    lead.nextFollowUpDate = followUpDate;
    lead.status = 'Scheduled';
    lead.followUpNotes = notes || '';
    
    await this.addNoteToLead(id, { note: `Follow-up scheduled: ${notes}` });
    
    return this.leadRepo.save(lead);
  }

  async deleteLead(id: number): Promise<void> {
    const lead = await this.getLeadById(id);
    await this.leadRepo.remove(lead);
  }

  async bulkCreateFromCsv(csvContent: string): Promise<{
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
}

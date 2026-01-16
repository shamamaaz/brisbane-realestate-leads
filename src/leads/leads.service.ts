// leads.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadAssignmentsService } from '../lead-assignments/lead-assignments.service';
import { Lead } from './entities/lead.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    private readonly leadAssignmentService: LeadAssignmentsService,
  ) {}

  async createLead(leadData: Partial<Lead>): Promise<Lead> {
    const lead = this.leadRepo.create(leadData);
    const savedLead = await this.leadRepo.save(lead);

    // Auto-assign the lead
    await this.leadAssignmentService.assignLeadToAgents(savedLead);

    return savedLead;
  }
}

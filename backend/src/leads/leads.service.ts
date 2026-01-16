import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadAssignmentsService } from '../lead-assignments/lead-assignments.service';
import { CreateLeadDto } from '../shared/dto/create-lead.dto';
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
      .orderBy('lead.createdAt', 'DESC');

    if (status) {
      query.andWhere('lead.status = :status', { status });
    }

    if (propertyType) {
      query.andWhere('lead.propertyType = :propertyType', { propertyType });
    }

    return query.getMany();
  }

  async getLeadById(id: number): Promise<Lead> {
    const lead = await this.leadRepo.findOne({
      where: { id },
      relations: ['agency', 'territory'],
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

  async updateLeadStatus(id: number, status: string): Promise<Lead> {
    const validStatuses = ['New', 'Contacted', 'Scheduled', 'Closed'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const lead = await this.getLeadById(id);
    lead.status = status;
    lead.updatedAt = new Date();
    return this.leadRepo.save(lead);
  }

  async deleteLead(id: number): Promise<void> {
    const lead = await this.getLeadById(id);
    await this.leadRepo.remove(lead);
  }
}

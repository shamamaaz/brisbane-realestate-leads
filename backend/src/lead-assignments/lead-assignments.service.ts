import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../agents/entities/agent.entity';
import { Lead } from '../leads/entities/lead.entity';
import { AssignmentStatus, LeadAssignment } from './entities/lead-assignment.entity';

@Injectable()
export class LeadAssignmentsService {
  constructor(
    @InjectRepository(LeadAssignment)
    private readonly leadAssignmentRepo: Repository<LeadAssignment>,

    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,

    @InjectRepository(Agent)
    private readonly agentRepo: Repository<Agent>,
  ) {}

   async assignLeadToAgents(lead: Lead) {
    if (!lead.territory) {
      throw new NotFoundException('Lead has no territory assigned.');
    }

    // Use QueryBuilder to safely query agents by territory and optional agency
    const query = this.agentRepo
      .createQueryBuilder('agent')
      .leftJoinAndSelect('agent.territory', 'territory')
      .leftJoinAndSelect('agent.agency', 'agency')
      .where('territory.id = :territoryId', { territoryId: lead.territory.id });

    if (lead.agency?.id) {
      query.andWhere('agency.id = :agencyId', { agencyId: lead.agency.id });
    }

    let agents = await query.getMany();

    if (!agents.length) {
      throw new NotFoundException('No agents found for this lead.');
    }

    if (!lead.agency?.id) {
      const firstAgency = agents.find((agent) => agent.agency)?.agency;
      if (!firstAgency) {
        throw new NotFoundException('No agencies found for this lead.');
      }
      lead.agency = firstAgency;
      lead.agencyId = firstAgency.id;
      await this.leadRepo.save(lead);
      agents = agents.filter((agent) => agent.agency?.id === firstAgency.id);
    }

    // Create assignments for all matched agents
    const assignments = agents.map(agent => {
      const assignment = new LeadAssignment();
      assignment.lead = lead;
      assignment.agent = agent;
      assignment.status = AssignmentStatus.PENDING;
      return assignment;
    });

    return this.leadAssignmentRepo.save(assignments);
  }

  /** Update status after agent contacts lead */
  async updateAssignmentStatus(id: number, status: AssignmentStatus, notes?: string) {
    const assignment = await this.leadAssignmentRepo.findOne({ where: { id } });
    if (!assignment) throw new Error('Assignment not found');

    assignment.status = status;
    if (notes) assignment.notes = notes;

    return this.leadAssignmentRepo.save(assignment);
  }

  /** List all assignments for a specific agent */
  async getAssignmentsForAgent(agentId: number) {
    return this.leadAssignmentRepo.find({
      where: { agent: { id: agentId } },
      relations: ['lead'],
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../agents/entities/agent.entity';
import { Agency } from '../agencies/entities/agency.entity';
import { User } from '../auth/entities/user.entity';
import { Lead } from '../leads/entities/lead.entity';
import { AssignmentStatus, LeadAssignment } from './entities/lead-assignment.entity';

@Injectable()
export class LeadAssignmentsService {
  constructor(
    @InjectRepository(LeadAssignment)
    private readonly leadAssignmentRepo: Repository<LeadAssignment>,

    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,

    @InjectRepository(Agency)
    private readonly agencyRepo: Repository<Agency>,

    @InjectRepository(Agent)
    private readonly agentRepo: Repository<Agent>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

   async assignLeadToAgents(lead: Lead) {
    if (!lead.agencyId) {
      const postcodeMatch = lead.propertyAddress?.match(/\b\d{4}\b/);
      if (!postcodeMatch) {
        throw new NotFoundException('Lead has no matching postcode.');
      }
      const agency = await this.agencyRepo
        .createQueryBuilder('agency')
        .where(':postcode = ANY(agency.postcodes)', { postcode: postcodeMatch[0] })
        .getOne();
      if (!agency) {
        throw new NotFoundException('No agencies found for this lead.');
      }
      lead.agency = agency;
      lead.agencyId = agency.id;
      await this.leadRepo.save(lead);
    }

    const agents = await this.agentRepo.find({
      where: { agencyId: lead.agencyId, isActive: true },
      order: { id: 'ASC' },
      relations: ['agency'],
    });

    if (!agents.length) {
      throw new NotFoundException('No agents found for this lead.');
    }

    const assignedAgent = agents[0];
    let agentUserId = assignedAgent.userId;
    if (!agentUserId) {
      const userMatch = await this.userRepo.findOne({ where: { email: assignedAgent.email } });
      agentUserId = userMatch?.id;
      if (agentUserId) {
        assignedAgent.userId = agentUserId;
        await this.agentRepo.save(assignedAgent);
      }
    }
    lead.assignedAgentId = agentUserId || assignedAgent.id;
    lead.assignedAgentName = assignedAgent.name;
    await this.leadRepo.save(lead);

    const assignment = new LeadAssignment();
    assignment.lead = lead;
    assignment.agent = assignedAgent;
    assignment.status = AssignmentStatus.PENDING;
    return this.leadAssignmentRepo.save(assignment);
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

import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User, UserRole } from '../auth/entities/user.entity';
import { Agency } from '../agencies/entities/agency.entity';
import { EmailService } from '../shared/email/email.service';
import { Agent } from './entities/agent.entity';
import { CreateAgentDto } from './dto/create-agent.dto';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private agentRepo: Repository<Agent>,
    @InjectRepository(Agency)
    private agencyRepo: Repository<Agency>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private emailService: EmailService,
  ) {}

  async getAllAgents(user: any): Promise<Agent[]> {
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role === UserRole.SYSTEM_ADMIN) {
      const agents = await this.agentRepo.find({ relations: ['agency'] });
      return this.enrichAgentsWithUsers(agents);
    }

    if (user.role === UserRole.AGENCY_ADMIN) {
      const agents = await this.agentRepo.find({
        where: { agencyId: user.agencyId },
        relations: ['agency'],
      });
      return this.enrichAgentsWithUsers(agents);
    }

    if (user.role === UserRole.AGENT) {
      const agents = await this.agentRepo.find({ where: { id: user.id }, relations: ['agency'] });
      return this.enrichAgentsWithUsers(agents);
    }

    throw new ForbiddenException('Access denied');
  }

  async createAgent(createAgentDto: CreateAgentDto, user: any): Promise<Agent> {
    if (user.role !== UserRole.AGENCY_ADMIN && user.role !== UserRole.SYSTEM_ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    const agencyId = user.role === UserRole.AGENCY_ADMIN ? user.agencyId : createAgentDto.agencyId;
    if (!agencyId) {
      throw new ForbiddenException('Agency is required');
    }

    const agency = await this.agencyRepo.findOne({ where: { id: agencyId } });
    if (!agency) {
      throw new ForbiddenException('Agency not found');
    }

    const existingUser = await this.userRepo.findOne({ where: { email: createAgentDto.email } });
    let createdUserId = existingUser?.id;

    if (!existingUser && createAgentDto.sendInvite) {
      const tempPassword = `Agent${Math.random().toString(36).slice(-8)}`;
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(tempPassword, salt);
      const newUser = this.userRepo.create({
        email: createAgentDto.email,
        name: createAgentDto.name,
        phone: createAgentDto.phone,
        role: UserRole.AGENT,
        passwordHash,
        agencyId: agency.id,
        agency: { id: agency.id },
        isActive: true,
      });
      const savedUser = await this.userRepo.save(newUser);
      createdUserId = savedUser.id;

      if (this.emailService.isConfigured()) {
        const webAppUrl = process.env.WEB_APP_URL || 'http://localhost:4200';
        const loginUrl = new URL('/auth/login', webAppUrl);
        try {
          await this.emailService.sendAgentInvite(createAgentDto.email, tempPassword, loginUrl.toString());
        } catch (error) {
          console.warn('Failed to send invite email:', error);
        }
      }
    }
    const newAgent = this.agentRepo.create({
      name: createAgentDto.name,
      email: createAgentDto.email,
      phone: createAgentDto.phone,
      territory: createAgentDto.territory || 'Unassigned',
      role: createAgentDto.role || 'agent',
      isActive: createAgentDto.isActive ?? true,
      leadsAssigned: 0,
      agency,
      agencyId: agency.id,
      userId: createdUserId,
    });

    return this.agentRepo.save(newAgent);
  }

  async updateAgent(id: number, payload: Partial<Agent>, user: any): Promise<Agent> {
    const agent = await this.agentRepo.findOne({ where: { id }, relations: ['agency'] });
    if (!agent) {
      throw new ForbiddenException('Agent not found');
    }

    if (user.role === UserRole.AGENCY_ADMIN && agent.agencyId !== user.agencyId) {
      throw new ForbiddenException('Access denied');
    }

    Object.assign(agent, {
      name: payload.name ?? agent.name,
      email: payload.email ?? agent.email,
      phone: payload.phone ?? agent.phone,
      territory: payload.territory ?? agent.territory,
      role: payload.role ?? agent.role,
      isActive: payload.isActive ?? agent.isActive,
    });

    return this.agentRepo.save(agent);
  }

  async getAgentById(id: number, user: any): Promise<Agent | null> {
    if (user.role === UserRole.AGENT && user.id !== id) {
      throw new ForbiddenException('Access denied');
    }

    const agent = await this.agentRepo.findOne({ where: { id }, relations: ['agency'] });
    if (user.role === UserRole.AGENCY_ADMIN && agent?.agencyId !== user.agencyId) {
      throw new ForbiddenException('Access denied');
    }

    if (agent) {
      const userMatch = await this.userRepo.findOne({ where: { email: agent.email } });
      if (userMatch && agent.userId !== userMatch.id) {
        agent.userId = userMatch.id;
        await this.agentRepo.save(agent);
      }
    }

    return agent;
  }

  getAssignmentsByAgentId() {
    return [];
  }

  private async enrichAgentsWithUsers(agents: Agent[]): Promise<Agent[]> {
    if (!agents.length) return agents;
    const emails = agents.map((agent) => agent.email);
    const users = await this.userRepo
      .createQueryBuilder('user')
      .where('user.email IN (:...emails)', { emails })
      .getMany();
    const byEmail = new Map(users.map((user) => [user.email, user.id]));

    const updates: Agent[] = [];
    for (const agent of agents) {
      const matchedId = byEmail.get(agent.email);
      if (matchedId && agent.userId !== matchedId) {
        agent.userId = matchedId;
        updates.push(agent);
      }
    }

    if (updates.length) {
      await this.agentRepo.save(updates);
    }

    return agents;
  }
}

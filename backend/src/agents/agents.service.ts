import { Injectable } from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';
import { AGENTS_SEED } from '../shared/data/agents-seed';

@Injectable()
export class AgentsService {
  private agents = AGENTS_SEED;

  getAllAgents() {
    return this.agents;
  }

  createAgent(createAgentDto: CreateAgentDto) {
    const nextId = this.agents.length
      ? Math.max(...this.agents.map((agent) => agent.id)) + 1
      : 1;

    const newAgent = {
      id: nextId,
      leadsAssigned: 0,
      agencyId: createAgentDto.agencyId ?? 1,
      territory: createAgentDto.territory ?? 'Unassigned',
      ...createAgentDto,
    };

    this.agents = [newAgent, ...this.agents];
    return newAgent;
  }

  getAgentById(id: number) {
    return this.agents.find((agent) => agent.id === id);
  }

  getAssignmentsByAgentId() {
    return [];
  }
}

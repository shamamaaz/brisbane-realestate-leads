import { Injectable } from '@nestjs/common';
import { AGENTS_SEED } from '../shared/data/agents-seed';

@Injectable()
export class AgentsService {
  private agents = AGENTS_SEED;

  getAllAgents() {
    return this.agents;
  }

  getAgentById(id: number) {
    return this.agents.find((agent) => agent.id === id);
  }

  getAssignmentsByAgentId() {
    return [];
  }
}

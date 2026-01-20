import { Controller, Get, Param } from '@nestjs/common';
import { AgentsService } from './agents.service';

@Controller('api/agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  getAllAgents() {
    return this.agentsService.getAllAgents();
  }

  @Get(':id')
  getAgentById(@Param('id') id: number) {
    return this.agentsService.getAgentById(Number(id));
  }

  @Get(':id/assignments')
  getAgentAssignments(@Param('id') id: number) {
    return this.agentsService.getAssignmentsByAgentId();
  }
}

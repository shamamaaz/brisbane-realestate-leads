import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';
import { AgentsService } from './agents.service';

@Controller('api/agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  getAllAgents() {
    return this.agentsService.getAllAgents();
  }

  @Post()
  createAgent(@Body() createAgentDto: CreateAgentDto) {
    return this.agentsService.createAgent(createAgentDto);
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

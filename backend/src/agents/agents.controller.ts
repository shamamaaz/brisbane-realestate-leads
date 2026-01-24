import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAgentDto } from './dto/create-agent.dto';
import { AgentsService } from './agents.service';

@Controller('api/agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getAllAgents(@Request() req: any) {
    return this.agentsService.getAllAgents(req.user);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createAgent(@Request() req: any, @Body() createAgentDto: CreateAgentDto) {
    return this.agentsService.createAgent(createAgentDto, req.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getAgentById(@Request() req: any, @Param('id') id: number) {
    return this.agentsService.getAgentById(Number(id), req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateAgent(@Request() req: any, @Param('id') id: number, @Body() payload: any) {
    return this.agentsService.updateAgent(Number(id), payload, req.user);
  }

  @Get(':id/assignments')
  getAgentAssignments(@Param('id') id: number) {
    return this.agentsService.getAssignmentsByAgentId();
  }
}

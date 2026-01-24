import { Injectable } from '@nestjs/common';
import { AgenciesService } from '../agencies/agencies.service';
import { AgentsService } from '../agents/agents.service';
import { LeadsService } from '../leads/leads.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly agenciesService: AgenciesService,
    private readonly agentsService: AgentsService,
  ) {}

  async getOverview(user: any) {
    const leads = await this.leadsService.getAllLeads(user);
    const agencies = await this.agenciesService.getAllAgencies();
    const agents = await this.agentsService.getAllAgents();

    const statusCounts = leads.reduce(
      (acc, lead) => {
        acc.total += 1;
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      },
      { total: 0 } as Record<string, number>,
    );

    return {
      leads: statusCounts,
      agenciesCount: agencies.length,
      agentsCount: agents.length,
    };
  }
}

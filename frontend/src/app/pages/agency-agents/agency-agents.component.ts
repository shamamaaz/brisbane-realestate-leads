import { Component, OnInit } from '@angular/core';
import { Agent } from '../../models/agent.model';
import { AgentService } from '../../services/agent.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-agency-agents',
  templateUrl: './agency-agents.component.html',
  styleUrls: ['./agency-agents.component.scss'],
})
export class AgencyAgentsComponent implements OnInit {
  agents: Agent[] = [];
  filteredAgents: Agent[] = [];
  territories: string[] = [];

  searchTerm = '';
  territoryFilter = 'all';

  isLoading = false;
  errorMessage = '';
  formError = '';
  isSaving = false;

  selectedAgent: Agent | null = null;
  isModalOpen = false;
  isCreateOpen = false;

  newAgent: Partial<Agent> = {
    name: '',
    email: '',
    phone: '',
    territory: '',
    agencyId: 1,
  };

  totalAgents = 0;
  activeAgents = 0;
  totalLeadsAssigned = 0;

  constructor(
    private agentService: AgentService,
    private authService: AuthService,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
    this.loadAgencyTheme();
    this.loadAgents();
  }

  private loadAgencyTheme() {
    this.authService.getCurrentUser().subscribe({
      next: (user: any) => {
        this.themeService.applyAgencyTheme(user.agency);
      },
      error: () => {},
    });
  }

  loadAgents() {
    this.isLoading = true;
    this.agentService.getAgents().subscribe({
      next: (agents) => {
        const sorted = [...agents].sort((a, b) => (b.leadsAssigned || 0) - (a.leadsAssigned || 0));
        this.agents = sorted;
        this.territories = this.buildTerritoryList(sorted);
        this.applyFilters();
        this.calculateStats();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load agents:', err);
        this.errorMessage = 'Failed to load agents. Please try again.';
        this.isLoading = false;
      },
    });
  }

  applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();
    const territory = this.territoryFilter;

    this.filteredAgents = this.agents.filter((agent) => {
      const matchesSearch = !term || this.agentMatchesSearch(agent, term);
      const matchesTerritory = territory === 'all' || agent.territory === territory;
      return matchesSearch && matchesTerritory;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onTerritoryChange() {
    this.applyFilters();
  }

  openAgent(agent: Agent) {
    this.selectedAgent = agent;
    this.isModalOpen = true;
  }

  openCreate() {
    this.formError = '';
    this.isCreateOpen = true;
  }

  closeCreate() {
    this.isCreateOpen = false;
    this.isSaving = false;
    this.formError = '';
    this.newAgent = {
      name: '',
      email: '',
      phone: '',
      territory: '',
      agencyId: 1,
    };
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedAgent = null;
  }

  emailAgent(agent: Agent) {
    if (!agent.email) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(agent.email).catch(() => {
        window.prompt('Copy email', agent.email);
      });
      return;
    }

    window.prompt('Copy email', agent.email);
  }

  callAgent(agent: Agent) {
    if (!agent.phone) return;
    window.location.href = `tel:${agent.phone}`;
  }

  createAgent() {
    if (!this.newAgent.name || !this.newAgent.email || !this.newAgent.phone) {
      this.formError = 'Name, email, and phone are required.';
      return;
    }

    this.formError = '';
    this.isSaving = true;

    this.agentService.createAgent(this.newAgent).subscribe({
      next: (agent) => {
        this.agents = [agent, ...this.agents];
        this.territories = this.buildTerritoryList(this.agents);
        this.applyFilters();
        this.calculateStats();
        this.isSaving = false;
        this.closeCreate();
      },
      error: (err) => {
        console.error('Failed to create agent:', err);
        this.formError = 'Failed to create agent. Please try again.';
        this.isSaving = false;
      },
    });
  }

  getAgentStatus(agent: Agent): string {
    if ((agent.leadsAssigned || 0) >= 20) {
      return 'High Load';
    }
    if ((agent.leadsAssigned || 0) > 0) {
      return 'Active';
    }
    return 'Available';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'High Load':
        return 'status-high';
      case 'Active':
        return 'status-active';
      default:
        return 'status-available';
    }
  }

  trackByAgentId(_: number, agent: Agent) {
    return agent.id;
  }

  private calculateStats() {
    this.totalAgents = this.agents.length;
    this.activeAgents = this.agents.filter((agent) => (agent.leadsAssigned || 0) > 0).length;
    this.totalLeadsAssigned = this.agents.reduce((sum, agent) => sum + (agent.leadsAssigned || 0), 0);
  }

  private buildTerritoryList(agents: Agent[]): string[] {
    const unique = new Set<string>();
    agents.forEach((agent) => {
      if (agent.territory) {
        unique.add(agent.territory);
      }
    });
    return Array.from(unique).sort();
  }

  private agentMatchesSearch(agent: Agent, term: string): boolean {
    return (
      agent.name.toLowerCase().includes(term) ||
      agent.email.toLowerCase().includes(term) ||
      agent.phone.toLowerCase().includes(term) ||
      (agent.territory || '').toLowerCase().includes(term)
    );
  }
}

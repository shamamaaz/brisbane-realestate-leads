import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Agent } from '../../models/agent.model';
import { AgentService } from '../../services/agent.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-agents',
  templateUrl: './admin-agents.component.html',
  styleUrls: ['./admin-agents.component.scss'],
})
export class AdminAgentsComponent implements OnInit {
  agents: Agent[] = [];
  filteredAgents: Agent[] = [];
  isLoading = false;
  errorMessage = '';

  searchTerm = '';

  constructor(
    private agentService: AgentService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.checkAuth();
    this.loadAgents();
  }

  checkAuth() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  loadAgents() {
    this.isLoading = true;
    this.errorMessage = '';
    this.agentService.getAgents().subscribe({
      next: (agents) => {
        this.agents = agents;
        this.applyFilters();
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
    this.filteredAgents = this.agents.filter((agent) => {
      if (!term) return true;
      return (
        agent.name.toLowerCase().includes(term) ||
        agent.email.toLowerCase().includes(term) ||
        agent.phone.toLowerCase().includes(term) ||
        (agent.territory || '').toLowerCase().includes(term)
      );
    });
  }

  onFilterChange() {
    this.applyFilters();
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LeadDetailModalComponent } from '../../components/lead-detail-modal/lead-detail-modal.component';
import { Lead } from '../../models/lead.model';
import { Agent } from '../../models/agent.model';
import { AgentService } from '../../services/agent.service';
import { LeadService } from '../../services/lead.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-agency-dashboard',
  templateUrl: './agency-dashboard.component.html',
  styleUrls: ['./agency-dashboard.component.scss']
})
export class AgencyDashboardComponent implements OnInit {
  leads: Lead[] = [];
  filteredLeads: Lead[] = [];

  agencyName = 'Agency';
  totalLeads = 0;
  activeAgents = 0;
  monthlyRevenue = 18750;

  agents: Agent[] = [];
  selectedAgent: Agent | null = null;
  isAgentModalOpen = false;

  statusFilter: string = '';
  propertyTypeFilter: string = '';
  searchText: string = '';

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  statsNew = 0;
  statsContacted = 0;
  statsScheduled = 0;
  statsClosed = 0;

  constructor(
    private leadService: LeadService,
    private agentService: AgentService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.checkAuth();
    this.loadAgencyInfo();
    this.loadAgents();
    this.loadLeads();
  }

  checkAuth() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  loadAgencyInfo() {
    this.authService.getCurrentUser().subscribe(
      (user: any) => {
        this.agencyName = user.agencyName || 'Agency';
      },
      (error) => {
        console.error('Failed to load agency info:', error);
      }
    );
  }

  loadLeads() {
    this.isLoading = true;
    this.errorMessage = '';

    this.leadService.getLeads().subscribe({
      next: (data) => {
        this.leads = data;
        this.totalLeads = data.length;
        this.activeAgents = this.agents.length;
        this.updateStats();
        this.filterLeads();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading leads:', err);
        this.errorMessage = 'Failed to load leads. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadAgents() {
    this.agentService.getAgents().subscribe({
      next: (agents) => {
        this.agents = agents;
        this.activeAgents = agents.length;
      },
      error: (err) => {
        console.error('Error loading agents:', err);
      },
    });
  }

  filterLeads() {
    this.filteredLeads = this.leads.filter(lead => {
      const matchesStatus = this.statusFilter ? lead.status === this.statusFilter : true;
      const matchesType = this.propertyTypeFilter ? lead.propertyType === this.propertyTypeFilter : true;
      const matchesSearch = this.searchText
        ? lead.homeownerName.toLowerCase().includes(this.searchText.toLowerCase()) ||
          lead.homeownerPhone.includes(this.searchText) ||
          lead.propertyAddress.toLowerCase().includes(this.searchText.toLowerCase())
        : true;
      return matchesStatus && matchesType && matchesSearch;
    });
  }

  updateStats() {
    this.statsNew = this.leads.filter(l => l.status === 'New').length;
    this.statsContacted = this.leads.filter(l => l.status === 'Contacted').length;
    this.statsScheduled = this.leads.filter(l => l.status === 'Scheduled').length;
    this.statsClosed = this.leads.filter(l => l.status === 'Closed').length;
  }

  resetFilters() {
    this.statusFilter = '';
    this.propertyTypeFilter = '';
    this.searchText = '';
    this.filterLeads();
  }

  manageAgent(agent: Agent) {
    this.selectedAgent = agent;
    this.isAgentModalOpen = true;
  }

  closeAgentModal() {
    this.isAgentModalOpen = false;
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'New':
        return 'status-new';
      case 'Contacted':
        return 'status-contacted';
      case 'Scheduled':
        return 'status-scheduled';
      case 'Closed':
        return 'status-closed';
      default:
        return '';
    }
  }

  updateStatus(lead: Lead, newStatus: string) {
    const previousStatus = lead.status;
    
    const statusUpdate = {
      status: newStatus,
      notes: `Status updated from ${previousStatus} to ${newStatus}`,
      lastContactedDate: new Date()
    };

    this.leadService.updateLeadStatus(lead.id!, statusUpdate).subscribe({
      next: (updatedLead) => {
        lead.status = newStatus;
        this.successMessage = `Lead status updated to ${newStatus}`;
        this.updateStats();
        this.filterLeads();
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        lead.status = previousStatus;
        this.errorMessage = 'Failed to update lead status. Please try again.';
      }
    });
  }
}

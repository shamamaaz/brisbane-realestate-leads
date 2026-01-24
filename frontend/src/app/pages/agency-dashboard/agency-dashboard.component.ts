import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LeadDetailModalComponent } from '../../components/lead-detail-modal/lead-detail-modal.component';
import { Lead } from '../../models/lead.model';
import { Agent } from '../../models/agent.model';
import { AgentService } from '../../services/agent.service';
import { LeadService } from '../../services/lead.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

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

  selectedFile: File | null = null;
  isUploading = false;
  uploadSuccess = '';
  uploadError = '';
  uploadResults: Array<{ row: number; message: string }> = [];
  successCount = 0;
  errorCount = 0;

  templateHeaders = [
    'homeownerName',
    'homeownerEmail',
    'homeownerPhone',
    'propertyAddress',
    'propertyType',
    'preferredAgency',
    'preferredContactTime',
  ];

  statsNew = 0;
  statsContacted = 0;
  statsScheduled = 0;
  statsClosed = 0;

  constructor(
    private leadService: LeadService,
    private agentService: AgentService,
    private authService: AuthService,
    private themeService: ThemeService,
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
        this.agencyName = user.agency?.name || 'Agency';
        this.themeService.applyAgencyTheme(user.agency);
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files && input.files.length > 0 ? input.files[0] : null;
    this.uploadError = '';
    this.uploadSuccess = '';
    this.uploadResults = [];
    this.successCount = 0;
    this.errorCount = 0;
  }

  uploadLeads() {
    if (!this.selectedFile) {
      this.uploadError = 'Please select a CSV file.';
      return;
    }

    this.isUploading = true;
    this.uploadError = '';
    this.uploadSuccess = '';
    this.uploadResults = [];
    this.successCount = 0;
    this.errorCount = 0;

    this.leadService.uploadLeadsCsv(this.selectedFile).subscribe({
      next: (res) => {
        this.successCount = res.successCount || 0;
        this.errorCount = res.errorCount || 0;
        this.uploadResults = res.errors || [];
        this.uploadSuccess = `Upload complete: ${this.successCount} leads added.`;
        if (this.errorCount > 0) {
          this.uploadSuccess += ` ${this.errorCount} rows failed.`;
        }
        this.isUploading = false;
        this.selectedFile = null;
        this.loadLeads();
      },
      error: (err) => {
        this.uploadError = err.error?.message || 'Upload failed. Please try again.';
        this.isUploading = false;
      },
    });
  }

  downloadTemplate() {
    const header = this.templateHeaders.join(',');
    const sampleRows = [
      'John Smith,john.smith@example.com,0412345678,123 Queen St Brisbane QLD 4000,house,Brisbane Central Realty,Evenings',
      'Sarah Lee,sarah.lee@example.com,0400111222,8 James St Fortitude Valley QLD 4006,apartment,,Mornings',
    ];
    const csv = [header, ...sampleRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lead-upload-template.csv';
    link.click();
    URL.revokeObjectURL(url);
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

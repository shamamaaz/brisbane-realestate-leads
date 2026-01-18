import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Lead } from '../../models/lead.model';
import { AuthService } from '../../services/auth.service';
import { LeadService } from '../../services/lead.service';

@Component({
  selector: 'app-agent-dashboard',
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.scss']
})
export class AgentDashboardComponent implements OnInit {
  leads: Lead[] = [];
  filteredLeads: Lead[] = [];
  
  agentName = 'Agent';
  agencyName = 'Agency';
  agencyBranding = {
    logo: '',
    colors: { primary: '#2563eb', secondary: '#ffffff' }
  };

  // Stats
  newLeadsCount = 0;
  followUpsCount = 0;
  appointmentsCount = 0;
  closedDealsCount = 0;

  // Filters
  statusFilter = 'all';
  selectedLead: Lead | null = null;
  isModalOpen = false;

  isLoading = false;
  errorMessage = '';

  constructor(
    private leadService: LeadService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAuth();
    this.loadAgentInfo();
    this.loadLeads();
  }

  checkAuth() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  loadAgentInfo() {
    this.authService.getCurrentUser().subscribe(
      (user: any) => {
        this.agentName = user.name || 'Agent';
      },
      (error) => {
        console.error('Failed to load agent info:', error);
      }
    );
  }

  loadLeads() {
    this.isLoading = true;
    this.leadService.getLeads().subscribe(
      (leads: Lead[]) => {
        this.leads = leads;
        this.filterLeads();
        this.calculateStats();
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'Failed to load leads';
        this.isLoading = false;
        console.error(error);
      }
    );
  }

  filterLeads() {
    if (this.statusFilter === 'all') {
      this.filteredLeads = this.leads;
    } else {
      this.filteredLeads = this.leads.filter(lead => lead.status === this.statusFilter);
    }
  }

  calculateStats() {
    this.newLeadsCount = this.leads.filter(l => l.status === 'New').length;
    this.followUpsCount = this.leads.filter(l => l.status === 'Contacted').length;
    this.appointmentsCount = this.leads.filter(l => l.status === 'Scheduled').length;
    this.closedDealsCount = this.leads.filter(l => l.status === 'Closed').length;
  }

  onStatusFilterChange() {
    this.filterLeads();
  }

  selectLead(lead: Lead) {
    this.selectedLead = lead;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedLead = null;
  }

  updateLeadStatus(newStatus: string) {
    if (!this.selectedLead) return;

    this.leadService.updateLeadStatus(this.selectedLead.id, {
      status: newStatus,
      lastContactedDate: new Date()
    }).subscribe(
      (updatedLead: Lead) => {
        const index = this.leads.findIndex(l => l.id === updatedLead.id);
        if (index !== -1) {
          this.leads[index] = updatedLead;
        }
        this.filterLeads();
        this.calculateStats();
        this.selectedLead = updatedLead;
      },
      (error) => {
        console.error('Failed to update lead:', error);
      }
    );
  }

  scheduleFollowUp(followUpDateString: string, notes: string) {
    if (!this.selectedLead || !followUpDateString) return;

    // Convert datetime-local string to Date
    const followUpDate = new Date(followUpDateString);

    this.leadService.scheduleFollowUp(this.selectedLead.id, followUpDate, notes).subscribe(
      (updatedLead: Lead) => {
        const index = this.leads.findIndex(l => l.id === updatedLead.id);
        if (index !== -1) {
          this.leads[index] = updatedLead;
        }
        this.filterLeads();
        this.selectedLead = updatedLead;
      },
      (error) => {
        console.error('Failed to schedule follow-up:', error);
      }
    );
  }

  addNote(noteText: string) {
    if (!this.selectedLead) return;

    this.leadService.addNoteToLead(this.selectedLead.id, noteText).subscribe(
      (updatedLead: Lead) => {
        const index = this.leads.findIndex(l => l.id === updatedLead.id);
        if (index !== -1) {
          this.leads[index] = updatedLead;
        }
        this.selectedLead = updatedLead;
      },
      (error) => {
        console.error('Failed to add note:', error);
      }
    );
  }

  callLead(leadId: number) {
    console.log('Calling lead:', leadId);
    // Future: integrate with calling system
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'Closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

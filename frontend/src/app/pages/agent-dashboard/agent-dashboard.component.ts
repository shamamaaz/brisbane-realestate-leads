import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreateAgentOffer } from '../../models/agent-offer.model';
import { Lead } from '../../models/lead.model';
import { AuthService } from '../../services/auth.service';
import { LeadService } from '../../services/lead.service';
import { OfferService } from '../../services/offer.service';

@Component({
  selector: 'app-agent-dashboard',
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.scss']
})
export class AgentDashboardComponent implements OnInit {
  leads: Lead[] = [];
  filteredLeads: Lead[] = [];
  
  agentName = 'Agent';
  agentEmail = '';
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
  propertyTypeFilter = 'all';
  searchTerm = '';
  selectedLead: Lead | null = null;
  isModalOpen = false;
  isViewOnly = false;

  // Form fields for modal
  newStatus = '';
  noteText = '';
  followUpDate = '';
  followUpTime = '';
  followUpNotes = '';
  showNotesPanel = false;
  offerError = '';
  offerSuccess = '';

  offerPriceMin: number | null = null;
  offerPriceMax: number | null = null;
  offerCommissionPercent: number | null = null;
  offerEstimatedDays: number | null = null;
  offerMessage = '';

  isLoading = false;
  errorMessage = '';

  constructor(
    private leadService: LeadService,
    private authService: AuthService,
    private offerService: OfferService,
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
        this.agentEmail = user.email || '';
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
    const term = this.searchTerm.trim().toLowerCase();
    const status = this.statusFilter;
    const type = this.propertyTypeFilter;

    this.filteredLeads = this.leads.filter((lead) => {
      const matchesStatus = status === 'all' || lead.status === status;
      const matchesType = type === 'all' || lead.propertyType === type;
      const matchesSearch = !term ||
        lead.homeownerName.toLowerCase().includes(term) ||
        lead.homeownerEmail.toLowerCase().includes(term) ||
        lead.homeownerPhone.includes(term) ||
        lead.propertyAddress.toLowerCase().includes(term);
      return matchesStatus && matchesType && matchesSearch;
    });
  }

  private applyLeadUpdate(updatedLead: Lead) {
    const updateList = (list: Lead[]) => {
      const index = list.findIndex(l => l.id === updatedLead.id);
      if (index !== -1) {
        list[index] = { ...list[index], ...updatedLead };
      }
    };

    updateList(this.leads);
    updateList(this.filteredLeads);
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

  onFilterChange() {
    this.filterLeads();
  }

  selectLead(lead: Lead) {
    this.selectedLead = lead;
    this.isModalOpen = true;
    this.isViewOnly = false;
    // Reset form fields
    this.newStatus = '';
    this.noteText = '';
    this.followUpDate = '';
    this.followUpTime = '';
    this.followUpNotes = '';
    this.resetOfferFields();
  }

  viewLead(lead: Lead) {
    this.selectedLead = lead;
    this.isModalOpen = true;
    this.isViewOnly = true;
    this.newStatus = '';
    this.noteText = '';
    this.followUpDate = '';
    this.followUpTime = '';
    this.followUpNotes = '';
    this.resetOfferFields();
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedLead = null;
    this.isViewOnly = false;
    // Reset form fields
    this.newStatus = '';
    this.noteText = '';
    this.followUpDate = '';
    this.followUpTime = '';
    this.followUpNotes = '';
    this.showNotesPanel = false;
    this.resetOfferFields();
  }

  updateLeadStatus() {
    if (!this.selectedLead || !this.newStatus) return;

    this.leadService.updateLeadStatus(this.selectedLead.id!, {
      status: this.newStatus
    }).subscribe(
      (updatedLead: Lead) => {
        this.applyLeadUpdate(updatedLead);
        this.filterLeads();
        this.calculateStats();
        this.selectedLead = { ...this.selectedLead, ...updatedLead };
        this.newStatus = '';
      },
      (error) => {
        console.error('Failed to update lead:', error);
      }
    );
  }

  scheduleFollowUp() {
    if (!this.selectedLead || !this.followUpDate || !this.followUpTime) return;

    const followUpDateObj = new Date(`${this.followUpDate}T${this.followUpTime}`);

    this.leadService.scheduleFollowUp(this.selectedLead.id!, followUpDateObj, this.followUpNotes).subscribe(
      (updatedLead: Lead) => {
        this.applyLeadUpdate(updatedLead);
        this.filterLeads();
        this.calculateStats();
        this.selectedLead = { ...this.selectedLead, ...updatedLead };
        this.followUpDate = '';
        this.followUpTime = '';
        this.followUpNotes = '';
      },
      (error) => {
        console.error('Failed to schedule follow-up:', error);
      }
    );
  }

  addNoteToLead() {
    if (!this.selectedLead || !this.noteText.trim()) return;

    this.leadService.addNoteToLead(this.selectedLead.id!, this.noteText).subscribe(
      (updatedLead: Lead) => {
        this.applyLeadUpdate(updatedLead);
        this.selectedLead = { ...this.selectedLead, ...updatedLead };
        this.noteText = '';
      },
      (error) => {
        console.error('Failed to add note:', error);
      }
    );
  }

  submitOffer() {
    if (!this.selectedLead) return;

    this.offerError = '';
    this.offerSuccess = '';

    const payload: CreateAgentOffer = {
      leadId: this.selectedLead.id!,
      agentName: this.agentName || 'Agent',
      agentEmail: this.agentEmail || undefined,
      agencyName: undefined,
      priceMin: this.offerPriceMin ?? undefined,
      priceMax: this.offerPriceMax ?? undefined,
      commissionPercent: this.offerCommissionPercent ?? undefined,
      estimatedDays: this.offerEstimatedDays ?? undefined,
      message: this.offerMessage.trim() || undefined,
    };

    if (!payload.priceMin && !payload.priceMax && !payload.message) {
      this.offerError = 'Add a price range or message before submitting.';
      return;
    }

    this.offerService.createOffer(payload).subscribe({
      next: () => {
        this.offerSuccess = 'Offer submitted.';
        this.loadLeads();
        this.resetOfferFields();
      },
      error: (err) => {
        console.error('Failed to submit offer:', err);
        this.offerError = 'Failed to submit offer. Please try again.';
      },
    });
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

  formatStatus(status: string): string {
    switch (status) {
      case 'New':
        return 'New';
      case 'Contacted':
        return 'Follow-Up';
      case 'Scheduled':
        return 'Appointment';
      case 'Closed':
        return 'Closed';
      default:
        return status;
    }
  }

  toggleNotesPanel() {
    this.showNotesPanel = !this.showNotesPanel;
  }

  private resetOfferFields() {
    this.offerError = '';
    this.offerSuccess = '';
    this.offerPriceMin = null;
    this.offerPriceMax = null;
    this.offerCommissionPercent = null;
    this.offerEstimatedDays = null;
    this.offerMessage = '';
  }
}

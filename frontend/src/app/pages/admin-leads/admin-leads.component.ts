import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Lead } from '../../models/lead.model';
import { AuthService } from '../../services/auth.service';
import { LeadService } from '../../services/lead.service';

@Component({
  selector: 'app-admin-leads',
  templateUrl: './admin-leads.component.html',
  styleUrls: ['./admin-leads.component.scss'],
})
export class AdminLeadsComponent implements OnInit {
  leads: Lead[] = [];
  filteredLeads: Lead[] = [];

  isLoading = false;
  errorMessage = '';

  statusFilter = 'all';
  propertyTypeFilter = 'all';
  searchTerm = '';

  selectedLead: Lead | null = null;
  isModalOpen = false;
  isViewOnly = false;

  newStatus = '';
  noteText = '';
  followUpDate = '';
  followUpTime = '';
  followUpNotes = '';
  showNotesPanel = false;

  constructor(
    private leadService: LeadService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.checkAuth();
    this.loadLeads();
  }

  checkAuth() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  loadLeads() {
    this.isLoading = true;
    this.errorMessage = '';
    this.leadService.getLeads().subscribe({
      next: (leads) => {
        this.leads = leads;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load leads:', err);
        this.errorMessage = 'Failed to load leads. Please try again.';
        this.isLoading = false;
      },
    });
  }

  applyFilters() {
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

  onFilterChange() {
    this.applyFilters();
  }

  viewLead(lead: Lead) {
    this.selectedLead = lead;
    this.isModalOpen = true;
    this.isViewOnly = true;
    this.resetModalFields();
  }

  manageLead(lead: Lead) {
    this.selectedLead = lead;
    this.isModalOpen = true;
    this.isViewOnly = false;
    this.resetModalFields();
  }

  closeModal() {
    this.selectedLead = null;
    this.isModalOpen = false;
    this.isViewOnly = false;
    this.resetModalFields();
    this.showNotesPanel = false;
  }

  updateLeadStatus() {
    if (!this.selectedLead || !this.newStatus) return;

    this.leadService.updateLeadStatus(this.selectedLead.id!, {
      status: this.newStatus,
    }).subscribe({
      next: (updatedLead) => {
        this.applyLeadUpdate(updatedLead);
        this.selectedLead = { ...this.selectedLead, ...updatedLead };
        this.newStatus = '';
      },
      error: (err) => {
        console.error('Failed to update status:', err);
      },
    });
  }

  scheduleFollowUp() {
    if (!this.selectedLead || !this.followUpDate || !this.followUpTime) return;

    const followUpDateObj = new Date(`${this.followUpDate}T${this.followUpTime}`);
    this.leadService.scheduleFollowUp(this.selectedLead.id!, followUpDateObj, this.followUpNotes).subscribe({
      next: (updatedLead) => {
        this.applyLeadUpdate(updatedLead);
        this.selectedLead = { ...this.selectedLead, ...updatedLead };
        this.followUpDate = '';
        this.followUpTime = '';
        this.followUpNotes = '';
      },
      error: (err) => {
        console.error('Failed to schedule follow-up:', err);
      },
    });
  }

  addNoteToLead() {
    if (!this.selectedLead || !this.noteText.trim()) return;

    this.leadService.addNoteToLead(this.selectedLead.id!, this.noteText).subscribe({
      next: (updatedLead) => {
        this.applyLeadUpdate(updatedLead);
        this.selectedLead = { ...this.selectedLead, ...updatedLead };
        this.noteText = '';
      },
      error: (err) => {
        console.error('Failed to add note:', err);
      },
    });
  }

  toggleNotesPanel() {
    this.showNotesPanel = !this.showNotesPanel;
  }

  formatStatus(status?: string): string {
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
        return status || 'New';
    }
  }

  private applyLeadUpdate(updatedLead: Lead) {
    const updateList = (list: Lead[]) => {
      const index = list.findIndex((l) => l.id === updatedLead.id);
      if (index !== -1) {
        list[index] = { ...list[index], ...updatedLead };
      }
    };

    updateList(this.leads);
    updateList(this.filteredLeads);
  }

  private resetModalFields() {
    this.newStatus = '';
    this.noteText = '';
    this.followUpDate = '';
    this.followUpTime = '';
    this.followUpNotes = '';
  }
}

import { Component, OnInit } from '@angular/core';
import { Lead } from '../../models/lead.model';
import { LeadService } from '../../services/lead.service';

@Component({
  selector: 'app-agency-dashboard',
  templateUrl: './agency-dashboard.component.html',
  styleUrls: ['./agency-dashboard.component.scss']
})
export class AgencyDashboardComponent implements OnInit {
  leads: Lead[] = [];
  filteredLeads: Lead[] = [];
  
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

  constructor(private leadService: LeadService) {}

  ngOnInit(): void {
    this.loadLeads();
  }

  loadLeads() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.leadService.getLeads().subscribe({
      next: (data) => {
        this.leads = data;
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

  updateStatus(lead: Lead, newStatus: string) {
    const previousStatus = lead.status;
    lead.status = newStatus;

    this.leadService.updateLead(lead.id!, { ...lead, status: newStatus }).subscribe({
      next: () => {
        this.successMessage = `Lead status updated to ${newStatus}`;
        this.updateStats();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error updating lead:', err);
        lead.status = previousStatus; // Revert on error
        this.errorMessage = 'Failed to update lead status. Please try again.';
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'New':
        return 'bg-red-100 text-red-800';
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  resetFilters() {
    this.statusFilter = '';
    this.propertyTypeFilter = '';
    this.searchText = '';
    this.filterLeads();
  }
}

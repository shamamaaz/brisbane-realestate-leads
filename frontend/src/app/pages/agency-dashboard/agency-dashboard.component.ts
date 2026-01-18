import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Lead } from '../../models/lead.model';
import { LeadService } from '../../services/lead.service';
import { LeadDetailModalComponent } from '../../components/lead-detail-modal/lead-detail-modal.component';

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

  constructor(
    private leadService: LeadService,
    private dialog: MatDialog
  ) {}

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

  /**
   * Open lead detail modal for viewing and managing a lead
   */
  openLeadDetail(lead: Lead) {
    const dialogRef = this.dialog.open(LeadDetailModalComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: { lead }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh the lead in the list
        const index = this.leads.findIndex(l => l.id === result.id);
        if (index !== -1) {
          this.leads[index] = result;
          this.filterLeads();
          this.updateStats();
        }
      }
    });
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

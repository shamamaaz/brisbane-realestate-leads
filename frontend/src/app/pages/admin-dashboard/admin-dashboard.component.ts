import { Component, OnInit } from '@angular/core';
import { Lead } from '../../models/lead.model';
import { AdminService } from '../../services/admin.service';
import { LeadService } from '../../services/lead.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  overview = {
    leads: { total: 0, New: 0, Contacted: 0, Scheduled: 0, Closed: 0 },
    agenciesCount: 0,
    agentsCount: 0,
  };
  leads: Lead[] = [];
  isLoading = false;

  constructor(
    private adminService: AdminService,
    private leadService: LeadService,
  ) {}

  ngOnInit(): void {
    this.loadOverview();
    this.loadLeads();
  }

  loadOverview() {
    this.adminService.getOverview().subscribe({
      next: (data) => {
        this.overview = data;
      },
      error: (err) => {
        console.error('Failed to load admin overview:', err);
      },
    });
  }

  loadLeads() {
    this.isLoading = true;
    this.leadService.getLeads().subscribe({
      next: (leads) => {
        this.leads = leads.slice(0, 6);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load leads:', err);
        this.isLoading = false;
      },
    });
  }
}

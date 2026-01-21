import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Lead } from '../../models/lead.model';
import { AuthService } from '../../services/auth.service';
import { LeadService } from '../../services/lead.service';

@Component({
  selector: 'app-seller-dashboard',
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.scss'],
})
export class SellerDashboardComponent implements OnInit {
  sellerName = 'Seller';
  leads: Lead[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private leadService: LeadService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.checkAuth();
    this.loadSellerInfo();
    this.loadLeads();
  }

  checkAuth() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  loadSellerInfo() {
    this.authService.getCurrentUser().subscribe({
      next: (user: any) => {
        this.sellerName = user.name || 'Seller';
      },
      error: (err) => {
        console.error('Failed to load seller info:', err);
      },
    });
  }

  loadLeads() {
    this.isLoading = true;
    this.errorMessage = '';
    this.leadService.getMyLeads().subscribe({
      next: (leads) => {
        this.leads = leads;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load seller leads:', err);
        this.errorMessage = 'Failed to load your requests. Please try again.';
        this.isLoading = false;
      },
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Agency } from '../../models/agency.model';
import { AgencyService } from '../../services/agency.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-agencies',
  templateUrl: './admin-agencies.component.html',
  styleUrls: ['./admin-agencies.component.scss'],
})
export class AdminAgenciesComponent implements OnInit {
  agencies: Agency[] = [];
  filteredAgencies: Agency[] = [];
  isLoading = false;
  errorMessage = '';

  searchTerm = '';

  constructor(
    private agencyService: AgencyService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.checkAuth();
    this.loadAgencies();
  }

  checkAuth() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  loadAgencies() {
    this.isLoading = true;
    this.errorMessage = '';
    this.agencyService.getAgencies().subscribe({
      next: (agencies) => {
        this.agencies = agencies;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load agencies:', err);
        this.errorMessage = 'Failed to load agencies. Please try again.';
        this.isLoading = false;
      },
    });
  }

  applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredAgencies = this.agencies.filter((agency) => {
      if (!term) return true;
      return (
        agency.name.toLowerCase().includes(term) ||
        agency.email.toLowerCase().includes(term) ||
        agency.phone.toLowerCase().includes(term) ||
        (agency.address || '').toLowerCase().includes(term)
      );
    });
  }

  onFilterChange() {
    this.applyFilters();
  }
}

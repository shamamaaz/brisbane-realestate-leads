import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LeadService } from '../../services/lead.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  formData = {
    propertyType: '',
    propertyStatus: '',
    propertyAddress: '',
    phoneNumber: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private leadService: LeadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize component
  }

  submitLead() {
    // Validate form
    if (!this.formData.propertyType || !this.formData.propertyStatus || !this.formData.propertyAddress) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const leadData = {
      homeownerName: 'Property Owner',
      homeownerEmail: 'email@example.com',
      homeownerPhone: this.formData.phoneNumber || 'Not provided',
      propertyAddress: this.formData.propertyAddress,
      propertyType: this.formData.propertyType,
      preferredContactTime: 'Flexible'
    };

    this.leadService.createLead(leadData).subscribe({
      next: (response) => {
        this.successMessage = 'Lead submitted successfully! Redirecting...';
        this.isLoading = false;
        // Reset form
        this.formData = {
          propertyType: '',
          propertyStatus: '',
          propertyAddress: '',
          phoneNumber: ''
        };
        // Redirect to thank you page after delay
        setTimeout(() => {
          this.router.navigate(['/sell/thank-you']);
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = 'Failed to submit lead. Please try again.';
        this.isLoading = false;
        console.error('Error submitting lead:', error);
      }
    });
  }
}

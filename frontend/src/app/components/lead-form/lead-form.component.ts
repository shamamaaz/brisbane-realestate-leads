import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgencyService } from '../../services/agency.service';
import { AuthService } from '../../services/auth.service';
import { LeadService } from '../../services/lead.service';

@Component({
  selector: 'app-lead-form',
  templateUrl: './lead-form.component.html',
  styleUrls: ['./lead-form.component.scss']
})
export class LeadFormComponent {
  leadForm: FormGroup;
  isSubmitting = false;
  submitMessage = '';
  submitError = '';
  suggestedAgencies: any[] = [];
  isLookingUpAgencies = false;

  @Output() submitLeadEvent = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private leadService: LeadService,
    private agencyService: AgencyService,
    private authService: AuthService
  ) {
    this.leadForm = this.fb.group({
      homeownerName: ['', Validators.required],
      homeownerEmail: ['', [Validators.required, Validators.email]],
      homeownerPhone: ['', Validators.required],
      propertyAddress: ['', Validators.required],
      propertyType: ['', Validators.required],
      preferredAgency: [''],
      preferredContactTime: ['']
    });
  }

  /**
   * Extract postcode from property address and lookup agencies
   */
  onPropertyAddressChange() {
    const address = this.leadForm.get('propertyAddress')?.value;
    if (!address) {
      this.suggestedAgencies = [];
      return;
    }

    // Extract 4-digit postcode from address
    const postcodeMatch = address.match(/\b\d{4}\b/);
    if (postcodeMatch) {
      this.lookupAgencies(postcodeMatch[0]);
    }
  }

  /**
   * Lookup agencies by postcode
   */
  lookupAgencies(postcode: string) {
    this.isLookingUpAgencies = true;
    this.agencyService.lookupByPostcode(postcode).subscribe({
      next: (res) => {
        this.suggestedAgencies = res.agencies || [];
        this.isLookingUpAgencies = false;
      },
      error: (err) => {
        console.error('Error looking up agencies:', err);
        this.suggestedAgencies = [];
        this.isLookingUpAgencies = false;
      }
    });
  }

  /**
   * Auto-fill preferred agency when user selects one
   */
  selectAgency(agency: any) {
    this.leadForm.patchValue({
      preferredAgency: agency.name
    });
    this.suggestedAgencies = [];
  }

  onSubmit() {
    if (this.leadForm.invalid) {
      this.submitError = 'Please fill all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitMessage = '';

    // Auto-register/login with homeowner email and a generated password
    const email = this.leadForm.get('homeownerEmail')?.value;
    const name = this.leadForm.get('homeownerName')?.value;
    const generatedPassword = 'Lead_' + Math.random().toString(36).slice(-8);

    this.authService.register(email, generatedPassword, name, 'homeowner').subscribe({
      next: () => {
        // Now submit the lead with the token
        this.leadService.createLead(this.leadForm.value).subscribe({
          next: (res) => {
            this.submitMessage = 'Thank you! Your lead has been submitted successfully.';
            this.submitLeadEvent.emit(res);
            this.leadForm.reset();
            this.suggestedAgencies = [];
            this.isSubmitting = false;

            // Clear message after 3 seconds
            setTimeout(() => {
              this.submitMessage = '';
            }, 3000);
          },
          error: (err) => {
            console.error('Error submitting lead:', err);
            this.submitError = err.error?.message || 'Failed to submit lead. Please try again.';
            this.isSubmitting = false;
          }
        });
      },
      error: (err) => {
        // If user already exists, try to login
        if (err.status === 400) {
          this.authService.login(email, generatedPassword).subscribe({
            next: () => {
              // Try to submit lead
              this.leadService.createLead(this.leadForm.value).subscribe({
                next: (res) => {
                  this.submitMessage = 'Thank you! Your lead has been submitted successfully.';
                  this.submitLeadEvent.emit(res);
                  this.leadForm.reset();
                  this.suggestedAgencies = [];
                  this.isSubmitting = false;

                  setTimeout(() => {
                    this.submitMessage = '';
                  }, 3000);
                },
                error: (leadErr) => {
                  console.error('Error submitting lead:', leadErr);
                  this.submitError = leadErr.error?.message || 'Failed to submit lead. Please try again.';
                  this.isSubmitting = false;
                }
              });
            },
            error: (loginErr) => {
              console.error('Authentication error:', loginErr);
              this.submitError = 'Failed to authenticate. Please try again.';
              this.isSubmitting = false;
            }
          });
        } else {
          console.error('Registration error:', err);
          this.submitError = err.error?.message || 'Failed to process lead. Please try again.';
          this.isSubmitting = false;
        }
      }
    });
  }
}

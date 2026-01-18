import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgencyService } from '../../services/agency.service';
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
    private agencyService: AgencyService
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
  }
}

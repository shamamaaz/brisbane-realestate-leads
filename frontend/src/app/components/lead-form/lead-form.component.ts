import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  @Output() submitLeadEvent = new EventEmitter<any>();

  constructor(private fb: FormBuilder, private leadService: LeadService) {
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

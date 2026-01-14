import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeadService } from '../../services/lead.service';

@Component({
  selector: 'app-lead-form',
  templateUrl: './lead-form.component.html',
})
export class LeadFormComponent {
  leadForm: FormGroup;

  constructor(private fb: FormBuilder, private leadService: LeadService) {
    this.leadForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      suburb: ['', Validators.required],
      message: [''],
    });
  }

  submit() {
    if (this.leadForm.valid) {
      this.leadService.createLead(this.leadForm.value).subscribe({
        next: (res) => alert('Lead submitted successfully!'),
        error: (err) => console.error(err),
      });
    }
  }
}

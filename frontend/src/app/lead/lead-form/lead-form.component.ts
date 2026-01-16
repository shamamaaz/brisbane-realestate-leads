import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeadService } from '../../services/lead.service';

@Component({
  selector: 'app-lead-form',
  templateUrl: './lead-form.component.html',
})
export class LeadFormComponent implements OnInit {
  leadForm: FormGroup;

  constructor(private fb: FormBuilder, private leadService: LeadService) {}

  ngOnInit() {
    this.leadForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      suburb: ['', Validators.required],
      propertyValue: [''],
    });
  }

  submit() {
    if (this.leadForm.valid) {
      this.leadService.createLead(this.leadForm.value).subscribe({
        next: (res) => console.log('Lead saved', res),
        error: (err) => console.error(err),
      });
    }
  }
}

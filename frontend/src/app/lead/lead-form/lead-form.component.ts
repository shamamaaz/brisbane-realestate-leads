import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-lead-form',
  templateUrl: './lead-form.component.html',
  styleUrls: ['./lead-form.component.scss']
})
export class LeadFormComponent implements OnInit {
  leadForm!: FormGroup;
  suburbs = ['Moorooka', 'Salisbury', 'South Brisbane', 'North Brisbane', 'Warwick'];

  constructor(private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {
    this.leadForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      suburb: ['', Validators.required],
      estimatedValue: ['']
    });
  }

  submitLead() {
    if (this.leadForm.valid) {
      this.http.post('http://localhost:3000/leads', this.leadForm.value)
        .subscribe({
          next: res => alert('Lead submitted!'),
          error: err => alert('Error submitting lead')
        });
    } else {
      alert('Please fill all required fields');
    }
  }
}

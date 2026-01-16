import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LeadFormComponent } from './lead-form/lead-form.component';
import { LeadRoutingModule } from './lead-routing.module';

@NgModule({
  declarations: [LeadFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LeadRoutingModule
  ]
})
export class LeadModule { }

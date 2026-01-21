import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminDashboardComponent } from '../pages/admin-dashboard/admin-dashboard.component';
import { AdminLeadsComponent } from '../pages/admin-leads/admin-leads.component';
import { AdminRoutingModule } from './admin-routing.module';

@NgModule({
  declarations: [AdminDashboardComponent, AdminLeadsComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
})
export class AdminModule {}

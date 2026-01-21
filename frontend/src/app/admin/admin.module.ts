import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminAgenciesComponent } from '../pages/admin-agencies/admin-agencies.component';
import { AdminAgentsComponent } from '../pages/admin-agents/admin-agents.component';
import { AdminDashboardComponent } from '../pages/admin-dashboard/admin-dashboard.component';
import { AdminLeadsComponent } from '../pages/admin-leads/admin-leads.component';
import { AdminRoutingModule } from './admin-routing.module';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminLeadsComponent,
    AdminAgenciesComponent,
    AdminAgentsComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
})
export class AdminModule {}

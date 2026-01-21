import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AgencyDashboardComponent } from '../pages/agency-dashboard/agency-dashboard.component';
import { AgencyAgentsComponent } from '../pages/agency-agents/agency-agents.component';
import { AgencyRoutingModule } from './agency-routing.module';

@NgModule({
  declarations: [AgencyDashboardComponent, AgencyAgentsComponent],
  imports: [
    CommonModule,
    AgencyRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
})
export class AgencyModule {}

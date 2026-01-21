import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AgentDashboardComponent } from '../pages/agent-dashboard/agent-dashboard.component';
import { AgentLeadsComponent } from '../pages/agent-leads/agent-leads.component';
import { AgentRoutingModule } from './agent-routing.module';

@NgModule({
  declarations: [AgentDashboardComponent, AgentLeadsComponent],
  imports: [
    CommonModule,
    AgentRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
})
export class AgentModule {}

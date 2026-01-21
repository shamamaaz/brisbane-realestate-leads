import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgentDashboardComponent } from '../pages/agent-dashboard/agent-dashboard.component';
import { AgentLeadsComponent } from '../pages/agent-leads/agent-leads.component';

const routes: Routes = [
  { path: '', component: AgentDashboardComponent },
  { path: 'leads', component: AgentLeadsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgentRoutingModule {}

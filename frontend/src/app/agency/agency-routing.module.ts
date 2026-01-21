import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgencyDashboardComponent } from '../pages/agency-dashboard/agency-dashboard.component';
import { AgencyAgentsComponent } from '../pages/agency-agents/agency-agents.component';

const routes: Routes = [
  { path: '', component: AgencyDashboardComponent },
  { path: 'agents', component: AgencyAgentsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgencyRoutingModule {}

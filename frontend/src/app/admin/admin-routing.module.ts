import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminAgenciesComponent } from '../pages/admin-agencies/admin-agencies.component';
import { AdminAgentsComponent } from '../pages/admin-agents/admin-agents.component';
import { AdminDashboardComponent } from '../pages/admin-dashboard/admin-dashboard.component';
import { AdminLeadsComponent } from '../pages/admin-leads/admin-leads.component';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'leads', component: AdminLeadsComponent },
  { path: 'agencies', component: AdminAgenciesComponent },
  { path: 'agents', component: AdminAgentsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}

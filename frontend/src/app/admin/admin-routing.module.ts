import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from '../pages/admin-dashboard/admin-dashboard.component';
import { AdminLeadsComponent } from '../pages/admin-leads/admin-leads.component';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'leads', component: AdminLeadsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}

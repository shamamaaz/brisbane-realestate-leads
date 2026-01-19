import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgencyDashboardComponent } from '../pages/agency-dashboard/agency-dashboard.component';

const routes: Routes = [
  { path: '', component: AgencyDashboardComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgencyRoutingModule {}

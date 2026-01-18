import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgencyDashboardComponent } from './pages/agency-dashboard/agency-dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { PropertyDetailComponent } from './pages/property-detail/property-detail.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'listings', component: HomeComponent },
  { path: 'about', component: HomeComponent },
  { path: 'contact', component: HomeComponent },
  { path: 'property/:id', component: PropertyDetailComponent },
  { path: 'agency-dashboard', component: AgencyDashboardComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

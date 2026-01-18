import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgencyDashboardComponent } from './pages/agency-dashboard/agency-dashboard.component';
import { AgentDashboardComponent } from './pages/agent-dashboard/agent-dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { PropertyDetailComponent } from './pages/property-detail/property-detail.component';
import { RegisterComponent } from './pages/register/register.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'submit', component: HomeComponent },
  { path: 'listings', component: HomeComponent },
  { path: 'about', component: HomeComponent },
  { path: 'contact', component: HomeComponent },
  { path: 'property/:id', component: PropertyDetailComponent },
  { path: 'agent', component: AgentDashboardComponent },
  { path: 'agency', component: AgencyDashboardComponent },
  { path: 'agency-dashboard', component: AgencyDashboardComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ThankYouComponent } from './pages/thank-you/thank-you.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  // 🌍 Public / Seller
  { path: '', component: HomeComponent },
  { path: 'sell', component: HomeComponent },
  { path: 'sell/thank-you', component: ThankYouComponent },

  // 🔐 Auth
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },

  // 🧑‍💼 Agent Portal
  {
    path: 'agent',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'agent' },
    loadChildren: () =>
      import('./agent/agent.module').then((m) => m.AgentModule),
  },

  // 🏢 Agency Portal
  {
    path: 'agency',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'agency' },
    loadChildren: () =>
      import('./agency/agency.module').then((m) => m.AgencyModule),
  },

  // 🛠 Admin Portal
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
  },

  // ❌ 404
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

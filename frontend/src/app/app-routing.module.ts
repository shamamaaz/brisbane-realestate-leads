import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForAgentsComponent } from './pages/for-agents/for-agents.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthCallbackComponent } from './pages/auth-callback/auth-callback.component';
import { RegisterComponent } from './pages/register/register.component';
import { LegalComponent } from './pages/legal/legal.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component';
import { SellerRegisterComponent } from './pages/seller-register/seller-register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ThankYouComponent } from './pages/thank-you/thank-you.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  // 🌍 Public / Landing
  { path: '', component: LandingComponent },
  { path: 'sell', redirectTo: '', pathMatch: 'full' },
  { path: 'thank-you', component: ThankYouComponent },
  { path: 'for-agents', component: ForAgentsComponent },

  // 🔐 Auth
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'legal', component: LegalComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'seller/register', component: SellerRegisterComponent },
  { path: 'auth/forgot', component: ForgotPasswordComponent },
  { path: 'auth/reset-password', component: ResetPasswordComponent },
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },
  { path: 'submit', redirectTo: '', pathMatch: 'full' },

  // 🏠 Seller Portal
  {
    path: 'seller',
    component: SellerDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['seller'] },
  },

  // 🧑‍💼 Agent Portal
  {
    path: 'agent',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['agent'] },
    loadChildren: () =>
      import('./agent/agent.module').then((m) => m.AgentModule),
  },

  // 🏢 Agency Portal
  {
    path: 'agency',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['agency_admin'] },
    loadChildren: () =>
      import('./agency/agency.module').then((m) => m.AgencyModule),
  },

  // 🛠 Admin Portal
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['system_admin'] },
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

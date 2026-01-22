import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { LeadDetailModalComponent } from './components/lead-detail-modal/lead-detail-modal.component';
import { LeadFormComponent } from './components/lead-form/lead-form.component';
import { PropertyCardComponent } from './components/shared/property-card/property-card.component';
import { SearchBarComponent } from './components/shared/search-bar/search-bar.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ForAgentsComponent } from './pages/for-agents/for-agents.component';
import { HomeComponent } from './pages/home/home.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { SellerAccessComponent } from './pages/seller-access/seller-access.component';
import { SellerLoginComponent } from './pages/seller-login/seller-login.component';
import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component';
import { PropertyDetailComponent } from './pages/property-detail/property-detail.component';
import { AuthCallbackComponent } from './pages/auth-callback/auth-callback.component';
import { RegisterComponent } from './pages/register/register.component';
import { SellComponent } from './pages/sell/sell.component';
import { ThankYouComponent } from './pages/thank-you/thank-you.component';

// Feature Modules
import { AdminModule } from './admin/admin.module';
import { AgencyModule } from './agency/agency.module';
import { AgentModule } from './agent/agent.module';

@NgModule({
  declarations: [
    AppComponent,
    AuthModalComponent,
    LeadFormComponent,
    LeadDetailModalComponent,
    HeaderComponent,
    FooterComponent,
    SearchBarComponent,
    PropertyCardComponent,
    LandingComponent,
    HomeComponent,
    PropertyDetailComponent,
    SellerAccessComponent,
    SellerLoginComponent,
    SellerDashboardComponent,
    AuthCallbackComponent,
    LoginComponent,
    RegisterComponent,
    SellComponent,
    ThankYouComponent,
    ForAgentsComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatDialogModule,
    // Feature modules (lazy-loaded)
    AgentModule,
    AgencyModule,
    AdminModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

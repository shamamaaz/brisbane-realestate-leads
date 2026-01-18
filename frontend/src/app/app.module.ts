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
import { AgencyDashboardComponent } from './pages/agency-dashboard/agency-dashboard.component';
import { AgentDashboardComponent } from './pages/agent-dashboard/agent-dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { PropertyDetailComponent } from './pages/property-detail/property-detail.component';
import { RegisterComponent } from './pages/register/register.component';


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
    HomeComponent,
    PropertyDetailComponent,
    AgencyDashboardComponent,
    AgentDashboardComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatDialogModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


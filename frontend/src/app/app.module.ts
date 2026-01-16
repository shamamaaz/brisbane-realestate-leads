import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { LeadFormComponent } from './components/lead-form/lead-form.component';
import { PropertyCardComponent } from './components/shared/property-card/property-card.component';
import { SearchBarComponent } from './components/shared/search-bar/search-bar.component';
import { AgencyDashboardComponent } from './pages/agency-dashboard/agency-dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { PropertyDetailComponent } from './pages/property-detail/property-detail.component';


@NgModule({
  declarations: [
    AppComponent,
    LeadFormComponent,
    HeaderComponent,
    FooterComponent,
    SearchBarComponent,
    PropertyCardComponent,
    HomeComponent,
    PropertyDetailComponent,
    AgencyDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule  
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }


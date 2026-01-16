import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PropertyDetailComponent } from './pages/property-detail/property-detail.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'property/:id', component: PropertyDetailComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

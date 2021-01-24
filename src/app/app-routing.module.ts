import { NgModule } from '@angular/core';
import { MapComponent } from './map/map.component';
import { Routes, RouterModule } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { RegisterComponent } from './register/register.component';
import { AddAttractionComponent } from './add-attraction/add-attraction.component';

const routes: Routes = [
  { path: '', redirectTo: 'signin', pathMatch: 'full'},
  { path: 'signin', component: SigninComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'map', component: MapComponent },
  { path: 'add-attraction', component: AddAttractionComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
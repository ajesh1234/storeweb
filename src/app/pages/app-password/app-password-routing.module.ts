
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppPasswordComponent } from './app-password.component';

const routes: Routes = [
  {
    path: '',
    component: AppPasswordComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppPasswordRoutingModule { }

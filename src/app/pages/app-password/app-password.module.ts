
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppPasswordRoutingModule } from './app-password-routing.module';
import { AppPasswordComponent } from './app-password.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [
    AppPasswordComponent
  ],
  imports: [
    CommonModule,
    AppPasswordRoutingModule,
    FormsModule,
    NgxSpinnerModule,
    ModalModule.forRoot(),
    NgxSkeletonLoaderModule.forRoot({ animation: 'progress-dark' })
  ]
})
export class AppPasswordModule { }

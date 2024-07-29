
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppProfileRoutingModule } from './app-profile-routing.module';
import { AppProfileComponent } from './app-profile.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [
    AppProfileComponent
  ],
  imports: [
    CommonModule,
    AppProfileRoutingModule,
    FormsModule,
    NgxSpinnerModule,
    ModalModule.forRoot(),
    NgxSkeletonLoaderModule.forRoot({ animation: 'progress-dark' })
  ]
})
export class AppProfileModule { }

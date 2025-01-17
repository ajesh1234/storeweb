
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ForgotRoutingModule } from './forgot-routing.module';
import { ForgotComponent } from './forgot.component';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgOtpInputModule } from 'ng-otp-input';

@NgModule({
  declarations: [
    ForgotComponent
  ],
  imports: [
    CommonModule,
    ForgotRoutingModule,
    FormsModule,
    NgxSpinnerModule,
    NgOtpInputModule
  ]
})
export class ForgotModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { PendingComponent } from './pending/pending.component';
import { RegistrationComponent } from './registration/registration.component';
import { Home1Component } from './home1/home1.component';
import { OtpComponent } from './otp/otp.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AfterloginComponent } from './afterlogin/afterlogin.component';



@NgModule({
  declarations: [
    LoginComponent,
    RegistrationComponent,
    SignupComponent,
    PendingComponent,
    Home1Component,
    OtpComponent,
    AfterloginComponent
  ],
  imports: [
    CommonModule, MatSlideToggleModule,
    HomeRoutingModule, FormsModule, HttpClientModule, ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule, MatCardModule,
    MatSortModule,
    MatFormFieldModule, MatProgressSpinnerModule, MatInputModule, MatIconModule, MatTooltipModule
  ]
})
export class HomeModule { }

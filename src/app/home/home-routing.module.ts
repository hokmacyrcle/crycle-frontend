import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { Home1Component } from './home1/home1.component';
import { RegistrationComponent } from './registration/registration.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { PendingComponent } from './pending/pending.component';
import { OtpComponent } from './otp/otp.component';
import { AfterloginComponent } from './afterlogin/afterlogin.component';


const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: SignupComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'pending', component: PendingComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'otp', component: OtpComponent },
  {path:'company-selection', component: AfterloginComponent}


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }

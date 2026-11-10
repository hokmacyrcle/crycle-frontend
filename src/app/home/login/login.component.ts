import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';
import { AlertService } from 'src/app/services/alert.service';
import { toAppRole, EMPLOYEE_HOME, EMPLOYER_HOME } from '../../core/roles';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  emailTouched: boolean = false;
  passwordTouched: boolean = false;
  public formData = new FormData();
  passwordshown: boolean = false;
  showPassword: boolean = false;
  passwordType: string = 'password';
  owner = {
    email: '',
    password: ''
  };
  loading = false;
  apiresponse: any;
  constructor(private router: Router, private service: AccountService, private alertservice: AlertService) { }

  ngOnInit(): void {
  }


  // onSubmit(): void {
  //   if (!this.email || !this.password) {

  //     return;
  //   }
  //   this.loading = true;
  //   this.emailTouched = true;
  //   this.passwordTouched = true;
  //   this.service.login(this.email, this.password).subscribe(
  //     (res) => {
  //       this.apiresponse = res;
  //       if (res.status == true) {

  //         this.alertservice.successSwalnew('', res.message);
  //         console.log('access_token' + JSON.stringify(res))
  //         localStorage.setItem('token_type', res.data.token_type);
  //         localStorage.setItem('access_token', res.data.access_token);
  //         localStorage.setItem('user_id', res.data.user.user_id);
  //         localStorage.setItem('name', res.data.user.name);
  //         const fullToken = `${res.data.token_type} ${res.data.access_token}`;
  //         localStorage.setItem('full_token', fullToken);
  //            this.router.navigate(['admin/Dashboard']);
  //         switch (res.data.user.role) {

  //           case 'admin':
  //             {
  //               this.router.navigate(['/admin/Dashboard']);
  //             }
  //             break;
  //           case 'contact': {
  //             this.router.navigate(['/admin/AllPages']);
  //           }
  //         }
  //         this.loading = false;
  //       }
  //       else if (res.status == false) {
  //         this.alertservice.successSwalnew('', res.message);
  //         this.loading = false;
  //       }
  //       this.alertservice.successSwalnew('', res.message);
  //       this.loading = false;
  //     },
  //     (error) => {
  //       this.alertservice.DangerSwalnew('', error.error.message);
  //       console.log(error.error.message);
  //       console.error('Login error', error.message);
  //       this.loading = false;
  //     }
  //   );

  // }


   onSubmit(): void {
    if (!this.email || !this.password) {
      return;
    }
    this.loading = true;
    this.emailTouched = true;
    this.passwordTouched = true;
    this.service.login(this.email, this.password).subscribe(
      (res) => {
        this.apiresponse = res;
        if (res.status === true) {
          console.log('access_token: ' + JSON.stringify(res));
          localStorage.setItem('login_response', JSON.stringify(res)); // Store full response
          localStorage.setItem('token_type', res.data.token_type);
          localStorage.setItem('access_token', res.data.access_token);
          localStorage.setItem('user_id', res.data.user.user_id);
          localStorage.setItem('name', res.data.user.name);
          const fullToken = `${res.data.token_type} ${res.data.access_token}`;
          localStorage.setItem('full_token', fullToken);

          // Firm waiting for approval
          if (res.data.firm_status === 'pending' || res.data.firm_status === 'rejected') {
            this.router.navigate(['/pending']);
          } else if (res.data.companies && res.data.companies.length > 0) {
            this.router.navigate(['/company-selection']);
          } else {
            this.router.navigate([toAppRole(res.data.user.role) === 'employee' ? EMPLOYEE_HOME : EMPLOYER_HOME]);
          }
          this.loading = false;
        } else {
          this.alertservice.DangerSwalnew('', res.message);
          this.loading = false;
        }
      },
      (error) => {
        this.alertservice.DangerSwalnew('', error.error.message);
        console.error('Login error', error.error.message);
        this.loading = false;
      }
    );
  }
  public passwords() {
    console.log(this.passwordshown)
    if (this.passwordshown) {
      this.passwordshown = false;
      this.passwordType = 'password';
    }
    else {
      this.passwordshown = true;
      this.passwordType = 'text';
    }
  }

  togglePasswordVisibility() {
    console.log(this.showPassword)

    this.showPassword = !this.showPassword;
  }

  togglePasswordVisibilityS() {
    console.log(this.passwordType)

    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }
}

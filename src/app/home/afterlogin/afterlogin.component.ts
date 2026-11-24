import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';
import { AlertService } from 'src/app/services/alert.service';
import { toAppRole, EMPLOYEE_HOME, EMPLOYER_HOME } from '../../core/roles';

@Component({
  selector: 'app-afterlogin',
  templateUrl: './afterlogin.component.html',
  styleUrls: ['./afterlogin.component.scss']
})
export class AfterloginComponent {
  companies: any[] = [];
  filteredCompanies: any[] = [];
  searchTerm: string = '';
  loading = false;
  constructor(private router: Router, public service: AccountService, private alertService: AlertService) { }

  ngOnInit(): void {
    // Retrieve login response from localStorage
    const loginResponse = JSON.parse(localStorage.getItem('login_response') || '{}');
    this.companies = loginResponse.data?.companies || [];
    this.filteredCompanies = [...this.companies]; // Initialize filtered list
  }

  // Filter companies based on search input
  filterCompanies(): void {
    if (this.searchTerm.trim()) {
      this.filteredCompanies = this.companies.filter(company =>
        company.company_name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredCompanies = [...this.companies];
    }
  }



  // Sign out and return to login
  signOut(event?: Event): void {
    event?.preventDefault();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  selectCompany(company: any): void {
    this.loading = true;
    this.service.selectCompany(company.company_id).subscribe(
      (res) => {
        if (res.status === true) {
          localStorage.setItem('selected_company', JSON.stringify(company));
          // Optionally store additional data from response
          localStorage.setItem('company_selection_response', JSON.stringify(res.data));

          // Navigate based on user role
          const loginResponse = JSON.parse(localStorage.getItem('login_response') || '{}');
          const role = loginResponse.data?.user?.role || '';
          this.router.navigate([toAppRole(role) === 'employee' ? EMPLOYEE_HOME : EMPLOYER_HOME]);
        } else {
          this.alertService.DangerSwalnew('Could not open this business', res.message || 'Please try again.');
        }
        this.loading = false;
      },
      (error) => {
        this.alertService.DangerSwalnew('Could not open this business', error?.error?.message || 'Please try again.');
        console.error('Company selection error', error?.error?.message);
        this.loading = false;
      }
    );
  }

}
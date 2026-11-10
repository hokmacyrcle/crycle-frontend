import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-setting-organisation',
  templateUrl: './setting-organisation.component.html',
  styleUrls: ['./setting-organisation.component.scss']
})
export class SettingOrganisationComponent {
  organisationForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.organisationForm = this.fb.group({
      bankAccount: [''],
      paygLiability: [''],
      wagesExpense: [''],
      wagesPayable: [''],
      superLiability: [''],
      superExpense: [''],
      employeeGroup: [''],
      timesheetCategory: [''],
      showAnnualSalary: [true],
      showEmploymentBasis: [false],
      companyLogo: ['']
    });
  }

  showHistory = false;
  toggleHistory() {
    this.showHistory = !this.showHistory;
  }
}

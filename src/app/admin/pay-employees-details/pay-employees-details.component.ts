import { Component } from '@angular/core';

@Component({
  selector: 'app-pay-employees-details',
  templateUrl: './pay-employees-details.component.html',
  styleUrls: ['./pay-employees-details.component.scss']
})
export class PayEmployeesDetailsComponent {
  employees = [
    { firstName: 'Sally', lastName: 'Martin', group: 'HR', lastEdited: '12 Aug 2025', earnings: 5480.00, tax: 1147.00, super: 385.20, netPay: 4233.00, included: true },
    { firstName: 'James', lastName: 'Lebron', group: 'Sales', lastEdited: '10 Aug 2025', earnings: 971.66, tax: 32.00, super: 87.45, netPay: 879.66, included: true },
    { firstName: 'Oliver', lastName: 'Gray', group: 'Developers', lastEdited: '08 Aug 2025', earnings: 4580.00, tax: 1201.00, super: 340.20, netPay: 3339.00, included: true },
  ];

  showHistory = false;
  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  selectedEmployee: any = null;

  selectEmployee(emp: any) {
    this.selectedEmployee = emp;
  }
}

import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-payroll-history',
  templateUrl: './payroll-history.component.html',
  styleUrls: ['./payroll-history.component.scss']
})
export class PayrollHistoryComponent {
  filters = {
    startDate: '',
    endDate: '',
    user: 'All users',
    employee: 'All employees',
    type: 'All types'
  };

  users = ['Rakesh Chandra T', 'James Lebron'];
  employees = ['James Lebron', 'Odette Garrison'];
  types = ['Payslips', 'Pay Run', 'Opening Balances', 'Organisation'];

  payrollHistory = [
    {
      date: '21 Aug 2025 19:42',
      user: 'Rakesh Chandra T',
      employee: 'James Lebron',
      type: 'Payslips',
      item: 'Fortnight ending 31 Jul 2025',
      detail: 'Downloaded payslip'
    },
    {
      date: '21 Aug 2025 19:29',
      user: 'Rakesh Chandra T',
      employee: '',
      type: 'Payroll Settings: Pay Items',
      item: 'Deductions pay item, FBT',
      detail: 'Added deduction pay item...'
    }
  ];
  showExport = false;

toggleExportMenu() {
  this.showExport = !this.showExport;
}

@HostListener('document:click', ['$event'])
handleClick(event: Event) {
  const target = event.target as HTMLElement;

  if (!target.closest('.relative')) {
    this.showExport = false; 
  }
}

}

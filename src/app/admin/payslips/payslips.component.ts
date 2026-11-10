import { Component } from '@angular/core';

@Component({
  selector: 'app-payslips',
  templateUrl: './payslips.component.html',
  styleUrls: ['./payslips.component.scss']
})
export class PayslipsComponent {
  // Payslip History Data
  payslips = [
    { period: 'Fortnight ending 31 Jul 2025', paymentDate: '01 Aug 2025', totalPay: '1,296.25' },
    { period: 'Fortnight ending 17 Jul 2025', paymentDate: '18 Jul 2025', totalPay: '1,296.25' }
  ];

  // History Section Toggle
  showHistory: boolean = false;

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  // Download payslip event
  downloadPayslip(payslip: any) {
    console.log("Downloading payslip: ", payslip);
  }
}

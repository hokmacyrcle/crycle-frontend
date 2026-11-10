import { Component } from '@angular/core';

@Component({
  selector: 'app-paytemplate',
  templateUrl: './paytemplate.component.html',
  styleUrls: ['./paytemplate.component.scss']
})
export class PaytemplateComponent {
  // Earnings list
  earnings: { name: string, value: string }[] = [
    { name: 'Bonus and commissions', value: '' },
    { name: 'Director Fees', value: '' },
    { name: 'Director Fees', value: '' },
  ];

  // Deductions list
  deductions: { name: string, value: string }[] = [
    { name: 'Tax Deduction', value: '' }
  ];

  // Superannuation list
  superannuations: { name: string, value: string }[] = [
    { name: 'HESTA Super - SGC - USI', value: '' },
    { name: 'HESTA Super - Salary Sacrifice - USI', value: '' }
  ];

  // Reimbursemen list
  reimbursemen: { name: string, value: string }[] = [

  ];

  // Modal states
  modal1 = false;
  modal2 = false;
  modal3 = false;
  modal4 = false;
  modal5 = false;
  modal6 = false;
  modal7 = false;
  modal8 = false;

  newEarningName: string = '';
  newDeductionName: string = '';
  newSuperannuationName: string = '';
  newReimbursemenName: string = '';

  // ---- Earnings Functions ----
  addEarningLine() {
    if (this.newEarningName.trim()) {
      this.earnings.push({ name: this.newEarningName, value: '' });
      this.newEarningName = '';
      this.closeModal(3);
    }
  }
  removeEarningLine(index: number) {
    this.earnings.splice(index, 1);
  }

  // ---- Deduction Functions ----
  addDeductionLine() {
    if (this.newDeductionName.trim()) {
      this.deductions.push({ name: this.newDeductionName, value: '' });
      this.newDeductionName = '';
      this.closeModal(4);
    }
  }
  removeDeductionLine(index: number) {
    this.deductions.splice(index, 1);
  }

  // ---- Superannuation Functions ----
  addSuperannuationLine() {
    if (this.newSuperannuationName.trim()) {
      this.superannuations.push({ name: this.newSuperannuationName, value: '' });
      this.newSuperannuationName = '';
      this.closeModal(2);
    }
  }
  removeSuperannuationLine(index: number) {
    this.superannuations.splice(index, 1);
  }

  addReimbursemenLine() {
    if (this.newReimbursemenName.trim()) {
      this.reimbursemen.push({ name: this.newReimbursemenName, value: '' });
      this.newReimbursemenName = '';
      this.closeModal(5);
    }
  }
  removeReimbursemenLine(index: number) {
    this.reimbursemen.splice(index, 1);
  }

  // ---- Modal Functions ----
  openModal(id: number) {
    if (id === 1) this.modal1 = true;
    if (id === 2) this.modal2 = true;
    if (id === 3) this.modal3 = true;
    if (id === 4) this.modal4 = true;
    if (id === 5) this.modal5 = true;
    if (id === 6) this.modal6 = true;
    if (id === 7) this.modal7 = true;
    if (id === 8) this.modal8 = true;
  }
  closeModal(id: number) {
    if (id === 1) this.modal1 = false;
    if (id === 2) this.modal2 = false;
    if (id === 3) this.modal3 = false;
    if (id === 4) this.modal4 = false;
    if (id === 5) this.modal5 = false;
    if (id === 6) this.modal6 = false;
    if (id === 7) this.modal7 = false;
    if (id === 8) this.modal8 = false;
  }

  // History Section Toggle
  showHistory: boolean = false;
  toggleHistory() {
    this.showHistory = !this.showHistory;
  }
}

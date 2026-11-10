import { Component } from '@angular/core';
export interface Receipt {
  receipt: string;
  createdBy: string;
  date: string;
  description: string;
  paymentAccount: string;
  amount: string;
  category: string;
}

const ELEMENT_DATA: Receipt[] = [
  {receipt: 'R-001', createdBy: 'Alice', date: '2025-08-01', description: 'Office Supplies', paymentAccount: 'Bank A', amount: '$120 / $10', category: 'Stationery'},
  {receipt: 'R-002', createdBy: 'Bob', date: '2025-08-05', description: 'Travel Expense', paymentAccount: 'Bank B', amount: '$250 / $20', category: 'Travel'},
  {receipt: 'R-003', createdBy: 'Charlie', date: '2025-08-10', description: 'Client Lunch', paymentAccount: 'Cash', amount: '$80 / $8', category: 'Meals'}
];
@Component({
  selector: 'app-banktransactionreceipts',
  templateUrl: './banktransactionreceipts.component.html',
  styleUrls: ['./banktransactionreceipts.component.scss']
})
export class BanktransactionreceiptsComponent {
displayedColumns: string[] = ['receipt', 'createdBy', 'date', 'description', 'paymentAccount', 'amount', 'category', 'action'];
  dataSource = ELEMENT_DATA;
  viewReceipt(id: string) {
    console.log('View receipt:', id);
  }

  editReceipt(id: string) {
    console.log('Edit receipt:', id);
  }

  deleteReceipt(id: string) {
    console.log('Delete receipt:', id);
  }
}

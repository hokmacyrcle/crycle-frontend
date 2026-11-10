import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
export interface Transaction {
  templateName: string;
  type: string;
  txnType: string;
  interval: string;
  previousDate: string;
  nextDate: string;
  customerSupplier: string;
  amount: number;
}

@Component({
  selector: 'app-bank-recurring-transactions',
  templateUrl: './bank-recurring-transactions.component.html',
  styleUrls: ['./bank-recurring-transactions.component.scss']
})
export class BankRecurringTransactionsComponent {
  displayedColumns: string[] = [
    'templateName',
    'type',
    'txnType',
    'interval',
    'previousDate',
    'nextDate',
    'customerSupplier',
    'amount',
    'action'
  ];
  dataSource = new MatTableDataSource<Transaction>([
    {
      templateName: 'Adwin Ko - Entertainment',
      type: 'Scheduled',
      txnType: 'Sales Receipt',
      interval: 'Every 2 Weeks',
      previousDate: '02/08/2025',
      nextDate: '16/08/2025',
      customerSupplier: 'Adwin Ko',
      amount: 900.00
    },
    {
      templateName: 'Benjamin Yeung - Water Bottles',
      type: 'Scheduled',
      txnType: 'Invoice',
      interval: 'Every Month',
      previousDate: '',
      nextDate: '11/08/2025',
      customerSupplier: 'Benjamin Yeung',
      amount: 990.00
    },
    {
      templateName: 'Charlie Whitehead - monthly agreement',
      type: 'Scheduled',
      txnType: 'Invoice',
      interval: 'Every 12 Months',
      previousDate: '',
      nextDate: '07/07/2025',
      customerSupplier: 'Charlie Whitehead',
      amount: 1320.00
    },
    {
      templateName: 'Cheng-Cheng Lok',
      type: 'Scheduled',
      txnType: 'Invoice',
      interval: 'Every Month',
      previousDate: '',
      nextDate: '11/08/2025',
      customerSupplier: 'Cheng-Cheng Lok',
      amount: 350.00
    },
    {
      templateName: 'City Water Co',
      type: 'Scheduled',
      txnType: 'Bill',
      interval: 'Every Month',
      previousDate: '03/08/2025',
      nextDate: '02/09/2025',
      customerSupplier: 'City Water Co',
      amount: 213.15
    }
  ]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  viewTransaction(templateName: string) {
    console.log('View transaction:', templateName);
    // Implement view logic here
  }

  editTransaction(templateName: string) {
    console.log('Edit transaction:', templateName);
    // Implement edit logic here
  }

  deleteTransaction(templateName: string) {
    console.log('Delete transaction:', templateName);
    // Implement delete logic here
  }
}
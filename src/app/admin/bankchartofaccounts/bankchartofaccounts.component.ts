import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
export interface Account {
  name: string;
  accountType: string;
  detailType: string;
  currency: string;
  gstRate: string;
  quickBooksBalance: string;
  bankBalance: string;
}
@Component({
  selector: 'app-bankchartofaccounts',
  templateUrl: './bankchartofaccounts.component.html',
  styleUrls: ['./bankchartofaccounts.component.scss']
})
export class BankchartofaccountsComponent {
  newRule = {
    accountName: '',
    accountType: '',
    detailType: '',
    isSubaccount: false,
    description: ''
  };
  showCreateRuleForm = false;

  displayedColumns: string[] = [
    'name',
    'accountType',
    'detailType',
    'currency',
    'gstRate',
    'quickBooksBalance',
    'bankBalance',
    'action'
  ];
  dataSource = new MatTableDataSource<Account>([
    {
      name: 'Cash and cash equivalents',
      accountType: 'Cash and cash equivalents',
      detailType: 'BAL',
      currency: 'AUD',
      gstRate: '',
      quickBooksBalance: '$55,870.46',
      bankBalance: '$40,071.20'
    },
    {
      name: 'ComBank - Online Saver',
      accountType: 'Cash and cash equivalents',
      detailType: 'BAL',
      currency: 'AUD',
      gstRate: '',
      quickBooksBalance: '$0.00',
      bankBalance: ''
    },
    {
      name: 'Westpac - EveryBusiness',
      accountType: 'Cash and cash equivalents',
      detailType: 'BAL',
      currency: 'AUD',
      gstRate: '',
      quickBooksBalance: '-$1,375.00',
      bankBalance: ''
    }
  ]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // Optional: Add action handler
  performAction(element: Account) {
    console.log('Action clicked for:', element.name);
    // Implement your action logic here
  }

  openCreateRuleForm(): void {
    this.showCreateRuleForm = true;
    this.resetForm();
  }
  closeCreateRuleForm(): void {
    this.showCreateRuleForm = false;
    this.resetForm();
  }
  resetForm(): void {
    this.newRule = {
      accountName: '',
      accountType: '',
      detailType: '',
      isSubaccount: false,
      description: ''
    };
  }

  saveRule(): void {
    if (!this.newRule.accountName.trim() || !this.newRule.accountType || !this.newRule.detailType) {
      return;
    }
    // Add save logic here
  }
}
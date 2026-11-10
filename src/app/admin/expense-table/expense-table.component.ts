import { SelectionModel } from '@angular/cdk/collections';
import { Component, ViewChild, OnDestroy, AfterViewInit, OnInit, HostListener } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import {
  ApiResponse,
  invoices,
  InvoiceService,
} from 'src/app/services/invoice.service';

export interface Transaction {
  date:Date;
  type: string;
  no: string;
  batchNo: string;
  payee: string;
  class: string;
  location: string;
  status: string;
  method: string;
  source: string;
  category: string;
  memo: string;
  dueDate: Date;
  balance: number;
  totalBeforeTax: number;
  salesTax: number;
  total: number;
  action:string;
  attachments?: boolean;
}

@Component({
  selector: 'app-expense-table',
  templateUrl: './expense-table.component.html',
  styleUrls: ['./expense-table.component.scss'],
})
export class ExpenseTableComponent implements OnInit, OnDestroy {


  transactions: Transaction[] = [];
  selectedTransactions: Transaction[] = [];

  // Sort properties
  sortColumn: string = 'dueDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  dataSource = new MatTableDataSource<invoices>([]);
  selection = new SelectionModel<invoices>(true, []);

  loading = false;
  totalItems = 0;
  pageSize = 5;
  currentPage = 1;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  router: any;

  ngOnInit() {
    this.transactions = this.getDummyData();
    this.sortData();
  }

  //ngAfterViewInit() {
  //console.log('ngAfterViewInit called');
  // Initialize paginator and sort before fetching data
  //this.dataSource.paginator = this.paginator;
  // this.dataSource.sort = this.sort;
  //this.fetchinvoices(); // Fetch initial data

  //}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    // Clean up event listener
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selectedTransactions = [];
    } else {
      this.selectedTransactions = [...this.transactions];
    }
  }

  navigateTo(path: string) {
  this.router.navigate([path]);
}

  getDummyData(): Transaction[] {
    return [
      {
        date: new Date('2024-03-01'),
        type: 'Invoice',
        no: 'INV-2024-001',
        batchNo: 'B001',
        payee: 'Acme Corporation',
        class: 'Commercial',
        location: 'New York',
        status: 'Paid',
        method: 'Bank Transfer',
        source: 'Online',
        category: 'Services',
        memo: 'Web development services',
        dueDate: new Date('2024-03-15'),
        balance: 0,
        totalBeforeTax: 5000,
        salesTax: 450,
        total: 5450,
        action: 'Edit/View',
        attachments: true,
      },
      {
        date: new Date('2024-02-15'),
        type: 'Bill',
        no: 'BILL-2024-001',
        batchNo: 'B002',
        payee: 'City Water Co',
        class: 'Utilities',
        location: 'Los Angeles',
        status: 'Overdue',
        method: 'Check',
        source: 'Mail',
        category: 'Utilities - Water',
        memo: 'Monthly water bill',
        dueDate: new Date('2024-02-28'),
        balance: 213.15,
        totalBeforeTax: 193.77,
        salesTax: 19.38,
        total: 213.15,
        action: 'Edit/View',
        attachments: false,
      },
      {
        date: new Date('2024-03-05'),
        type: 'Expense',
        no: 'EXP-2024-001',
        batchNo: 'B003',
        payee: 'Jennifer Hargreaves',
        class: 'Travel',
        location: 'Chicago',
        status: 'Paid',
        method: 'Credit Card',
        source: 'Mobile App',
        category: 'Shipping and Delivery',
        memo: 'Business trip expenses',
        dueDate: new Date('2024-03-10'),
        balance: 0,
        totalBeforeTax: 850,
        salesTax: 68,
        total: 918,
        action: 'Edit/View',
        attachments: true,
      },
      {
        date: new Date('2024-03-10'),
        type: 'Cheque',
        no: '2078',
        batchNo: 'B004',
        payee: 'Michelle Long',
        class: 'Professional',
        location: 'Houston',
        status: 'Pending',
        method: 'Cheque',
        source: 'Office',
        category: "Owner's Drawings",
        memo: 'Consultant payment',
        dueDate: new Date('2024-03-20'),
        balance: 2500,
        totalBeforeTax: 2500,
        salesTax: 0,
        total: 2500,
        action: 'Edit/View',
        attachments: false,
      },
      {
        date: new Date('2024-03-20'),
        type: 'Invoice',
        no: 'INV-2024-002',
        batchNo: 'B005',
        payee: 'Tech Solutions Ltd',
        class: 'Commercial',
        location: 'Seattle',
        status: 'Draft',
        method: 'Wire Transfer',
        source: 'Online',
        category: 'Software License',
        memo: 'Annual software subscription',
        dueDate: new Date('2024-04-01'),
        balance: 1200,
        totalBeforeTax: 1000,
        salesTax: 100,
        total: 1100,
        action: 'Edit/View',
        attachments: true,
      },
      {
        date: new Date('2024-03-02'),
        type: 'Bill',
        no: 'BILL-2024-002',
        batchNo: 'B006',
        payee: 'Electric Company',
        class: 'Utilities',
        location: 'Phoenix',
        status: 'Paid',
        method: 'Auto Pay',
        source: 'Online',
        category: 'Utilities - Electric',
        memo: 'Monthly electricity bill',
        dueDate: new Date('2024-03-05'),
        balance: 0,
        totalBeforeTax: 320,
        salesTax: 25.6,
        total: 345.6,
        action: 'Edit/View',
        attachments: false,
      },
      {
        date: new Date('2024-03-02'),
        type: 'Expense',
        no: 'EXP-2024-002',
        batchNo: 'B007',
        payee: 'Office Supplies Inc',
        class: 'Office',
        location: 'Denver',
        status: 'Pending',
        method: 'Purchase Order',
        source: 'Vendor Portal',
        category: 'Office Supplies',
        memo: 'Quarterly office supplies',
        dueDate: new Date('2024-03-25'),
        balance: 450,
        totalBeforeTax: 375,
        salesTax: 30,
        total: 405,
        action: 'Edit/View',
        attachments: true,
      },
      {
        date: new Date('2024-03-02'),
        type: 'Invoice',
        no: 'INV-2024-003',
        batchNo: 'B008',
        payee: 'Global Marketing Corp',
        class: 'Marketing',
        location: 'Miami',
        status: 'Overdue',
        method: 'ACH',
        source: 'Email',
        category: 'Marketing Services',
        memo: 'Digital marketing campaign',
        dueDate: new Date('2024-02-20'),
        balance: 3500,
        totalBeforeTax: 3200,
        salesTax: 256,
        total: 3456,
        action: 'Edit/View',
        attachments: true,
      },
      {
        date: new Date('2024-03-02'),
        type: 'Bill',
        no: 'BILL-2024-003',
        batchNo: 'B009',
        payee: 'Internet Provider',
        class: 'Utilities',
        location: 'Boston',
        status: 'Paid',
        method: 'Online Payment',
        source: 'Website',
        category: 'Utilities - Internet',
        memo: 'Monthly internet service',
        dueDate: new Date('2024-03-12'),
        balance: 0,
        totalBeforeTax: 89.99,
        salesTax: 7.2,
        total: 97.19,
        action: 'Edit/View',
        attachments: false,
      },
      {
        date: new Date('2024-03-02'),
        type: 'Expense',
        no: 'EXP-2024-003',
        batchNo: 'B010',
        payee: 'Restaurant Supply Co',
        class: 'Equipment',
        location: 'Dallas',
        status: 'Draft',
        method: 'Credit Card',
        source: 'Phone Order',
        category: 'Equipment Purchase',
        memo: 'Kitchen equipment upgrade',
        dueDate: new Date('2024-04-15'),
        balance: 1800,
        totalBeforeTax: 1650,
        salesTax: 132,
        total: 1782,
        action: 'Edit/View',
        attachments: true,
      },
      {
        date: new Date('2024-03-02'),
        type: 'Bill',
        no: 'BILL-2024-004',
        batchNo: 'B011',
        payee: 'Gas Company',
        class: 'Utilities',
        location: 'San Francisco',
        status: 'Pending',
        method: 'Direct Debit',
        source: 'Online',
        category: 'Utilities - Gas',
        memo: 'Monthly gas bill',
        dueDate: new Date('2024-03-28'),
        balance: 156.75,
        totalBeforeTax: 142.5,
        salesTax: 14.25,
        total: 156.75,
        action: 'Edit/View',
        attachments: false,
      },
      {
        date: new Date('2024-03-02'),
        type: 'Invoice',
        no: 'INV-2024-004',
        batchNo: 'B012',
        payee: 'Consulting Partners',
        class: 'Professional',
        location: 'Atlanta',
        status: 'Paid',
        method: 'Wire Transfer',
        source: 'Email',
        category: 'Consulting Services',
        memo: 'Strategic planning consultation',
        dueDate: new Date('2024-03-18'),
        balance: 0,
        totalBeforeTax: 7500,
        salesTax: 600,
        total: 8100,
        action: 'Edit/View',
        attachments: true,
      },
      {
        date: new Date('2024-03-02'),
        type: 'Expense',
        no: 'EXP-2024-004',
        batchNo: 'B013',
        payee: 'Travel Agency',
        class: 'Travel',
        location: 'Orlando',
        status: 'Overdue',
        method: 'Corporate Card',
        source: 'Travel Portal',
        category: 'Travel & Entertainment',
        memo: 'Conference travel arrangements',
        dueDate: new Date('2024-02-25'),
        balance: 1250,
        totalBeforeTax: 1136.36,
        salesTax: 113.64,
        total: 1250,
        action: 'Edit/View',
        attachments: true,
      },
      {
        date: new Date('2024-03-02'),
        type: 'Cheque',
        no: '2079',
        batchNo: 'B014',
        payee: 'Legal Advisors LLC',
        class: 'Professional',
        location: 'Washington DC',
        status: 'Draft',
        method: 'Cheque',
        source: 'Office',
        category: 'Legal Services',
        memo: 'Contract review services',
        dueDate: new Date('2024-04-10'),
        balance: 3200,
        totalBeforeTax: 3200,
        salesTax: 0,
        total: 3200,
        action: 'Edit/View',
        attachments: false,
      },
      {
        date: new Date('2024-03-02'),
        type: 'Bill',
        no: 'BILL-2024-005',
        batchNo: 'B015',
        payee: 'Cleaning Services Co',
        class: 'Maintenance',
        location: 'Las Vegas',
        status: 'Paid',
        method: 'ACH',
        source: 'Vendor Portal',
        category: 'Maintenance & Cleaning',
        memo: 'Weekly office cleaning',
        dueDate: new Date('2024-03-08'),
        balance: 0,
        totalBeforeTax: 280,
        salesTax: 22.4,
        total: 302.4,
        action: 'Edit/View',
        attachments: false,
      },
    ];
  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortData();
  }

  sortData() {
    this.transactions.sort((a, b) => {
      let aVal: any = a[this.sortColumn as keyof Transaction];
      let bVal: any = b[this.sortColumn as keyof Transaction];

      if (aVal instanceof Date) {
        aVal = aVal.getTime();
        bVal = bVal.getTime();
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      let result = 0;
      if (aVal < bVal) result = -1;
      if (aVal > bVal) result = 1;

      return this.sortDirection === 'desc' ? -result : result;
    });
  }

  // Selection methods
  isSelected(transaction: Transaction): boolean {
    return this.selectedTransactions.includes(transaction);
  }

  isAllSelected(): boolean {
    return (
      this.selectedTransactions.length === this.transactions.length &&
      this.transactions.length > 0
    );
  }

  isPartialSelection(): boolean {
    return this.selectedTransactions.length > 0 && !this.isAllSelected();
  }

  toggleSelection(transaction: Transaction, event?: any) {
    if (event) {
      event.stopPropagation();
    }

    const index = this.selectedTransactions.indexOf(transaction);
    if (index === -1) {
      this.selectedTransactions.push(transaction);
    } else {
      this.selectedTransactions.splice(index, 1);
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}

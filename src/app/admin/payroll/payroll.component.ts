import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface PayRun {
  payPeriod: string;
  totalAmount: number;
  paymentDate: string;
  status: string;
}

export interface LeaveRequest {
  employee: string;
  leaveType: string;
  leavePeriod: string;
  status: string;
}

export interface Employee {
  firstName: string;
  lastName: string;
  employeeGroup: string;
  earnings: number;
  tax: number;
  super: number;
  netPay: number;
  included: boolean;
}

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss'],
})
export class PayrollComponent implements OnInit {
  // Dashboard data
  totalPayrollLastMonth = 19234.5;
  totalPayrollYearToDate = 21421.5;
  nextPayRunDate = '15 Aug';

  // Calendar
  selectedDate: Date | null = new Date(2025, 7, 25); // August 25, 2025
  minDate: Date = new Date(2025, 7, 1);
  maxDate: Date = new Date(2025, 7, 31);

  // Pay Runs Table
  payRunColumns: string[] = [
    'payPeriod',
    'totalAmount',
    'paymentDate',
    'status',
    'actions',
  ];
  payRunDataSource = new MatTableDataSource<PayRun>([
    {
      payPeriod: 'Fortnight ending 14 Aug 2025',
      totalAmount: 8451.66,
      paymentDate: '15 Aug 2025',
      status: 'Draft',
    },
  ]);

  // Leave Requests Table
  leaveColumns: string[] = [
    'employee',
    'leaveType',
    'leavePeriod',
    'status',
    'actions',
  ];
  leaveDataSource = new MatTableDataSource<LeaveRequest>([
    {
      employee: 'Oliver Gray',
      leaveType: 'Annual Leave',
      leavePeriod: '23 Sep 2025',
      status: 'Requested',
    },
  ]);

  // Employee Details (for payrun modal)
  employeeColumns: string[] = [
    'firstName',
    'lastName',
    'earnings',
    'tax',
    'super',
    'netPay',
    'included',
  ];
  employeeDataSource = new MatTableDataSource<Employee>([
    {
      firstName: 'James',
      lastName: 'Lebron',
      employeeGroup: '',
      earnings: 971.66,
      tax: 32.0,
      super: 87.45,
      netPay: 879.66,
      included: true,
    },
    {
      firstName: 'Oliver',
      lastName: 'Gray',
      employeeGroup: '',
      earnings: 4580.0,
      tax: 1201.0,
      super: 340.2,
      netPay: 3339.0,
      included: true,
    },
    {
      firstName: 'Sally',
      lastName: 'Martin',
      employeeGroup: '',
      earnings: 5480.0,
      tax: 1147.0,
      super: 385.2,
      netPay: 4233.0,
      included: true,
    },
  ]);

  // Modal states
  showPayrunDetails = false;
  showLeaveForm = false;
  showNewTaskMenu = false;

  // Leave form data
  leaveForm = {
    employee: 'Oliver Gray',
    typeOfRequest: 'Annual Leave',
    description: 'Trip to Sydney',
    startDate: new Date(2025, 8, 23), // Sep 23, 2025
    endDate: new Date(2025, 8, 23),
    currentLeaveBalance: 11.6002,
    payPeriod: 'Fortnight ending 25 Sep 2025',
    hours: 7.6,
  };

  constructor(private snackBar: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit(): void {}

  // Calendar date filter
  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    const day = date.getDate();
    // Highlight specific dates based on your calendar image
    const highlightedDates = [1, 15, 25, 29];
    return highlightedDates.includes(day);
  };

  // Event handlers
  openPayrunDetails(payrun: PayRun): void {
    this.showPayrunDetails = true;
  }

  closePayrunDetails(): void {
    this.showPayrunDetails = false;
  }

  openLeaveForm(leave?: LeaveRequest): void {
    if (leave) {
      this.leaveForm.employee = leave.employee;
    }
    this.showLeaveForm = true;
  }

  closeLeaveForm(): void {
    this.showLeaveForm = false;
  }

  toggleNewTaskMenu(): void {
    this.showNewTaskMenu = !this.showNewTaskMenu;
  }

  createNewTask(type: string): void {
    console.log('Creating new task:', type);

    switch (type) {
      case 'payrun':
        this.snackBar.open('✅ Pay Run created successfully!', 'Close', {
          duration: 3000, // auto close after 3 sec
          panelClass: ['success-snackbar'], // optional custom style
        });
        break;

      case 'timesheet':
        this.snackBar.open('🕒 Timesheet task created!', 'Close', {
          duration: 3000,
        });
        break;

      case 'employee':
        this.snackBar.open('👤 Employee task created!', 'Close', {
          duration: 3000,
        });
        break;
    }
  }

  // Leave form actions
  approveLeave(): void {
    console.log('Leave approved');
    this.closeLeaveForm();
  }

  rejectLeave(): void {
    console.log('Leave rejected');
    this.closeLeaveForm();
  }

  // Payrun actions
  postPayRun(): void {
    console.log('Pay run posted');
    this.closePayrunDetails();
  }

  resetPayRun(): void {
    console.log('Pay run reset');
  }

  deletePayRun(): void {
    console.log('Pay run deleted');
    this.closePayrunDetails();
  }

  viewReports(): void {
    console.log('Viewing reports');
  }

  addPayslipMessage(): void {
    console.log('Adding payslip message');
  }

  // Helper methods
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'warn';
      case 'requested':
        return 'accent';
      case 'approved':
        return 'primary';
      default:
        return 'basic';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  }
}

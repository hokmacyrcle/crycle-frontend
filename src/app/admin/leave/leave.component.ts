import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { PayrollService } from 'src/app/services/payroll.service';

interface LeaveType {
  id: number;
  name: string;
  type: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  children?: LeaveType[];
}

interface DropdownData {
  leave_types: LeaveType[];
  calculation_methods: any[];
  termination_options: any[];
}

interface ApiResponse {
  success: boolean;
  data: DropdownData;
}

@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
})
export class LeaveComponent implements OnInit {
  formErrors: { [key: string]: string[] } = {};
  isLoading = false;
  employeeId!: number;
  leaveTypes: LeaveType[] = [];
  calculationMethods: any[] = [];
  terminationOptions: any[] = [];
  selectedCalculationMethod: string = '';
  hoursAccruedAnnually: number | null = null;
  openingBalance: number | null = null;
  hours: number | null = null;
  companyId!: number;
  leaveBalances: { type: string; balance_hours: number; opening_hours: number }[] = [];

  // Dropdown states
  dropdown3Open = false;
  dropdown4Open = false;
  dropdown5Open = false;

  activeModal: string | null = null;
  selectedLeave: string = '';
  selectedTerminationOption: string = '';
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private payrollService: PayrollService, private snackBar: MatSnackBar
  ) { }

  // Leave Request Form Model
  leaveRequest = {
    employee_id: 0,
    leave_type: '',
    description: '',
    start_date: '',
    end_date: '',
    pay_period_hours: ''
  };


  ngOnInit(): void {
    const companyData = localStorage.getItem('selected_company');
    if (companyData) {
      try {
        const companyObj = JSON.parse(companyData);
        this.companyId = companyObj?.company_id;
      } catch (error) {
        console.error('Failed to parse selected_company from localStorage', error);
      }
    }
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.employeeId = +id;
        this.leaveRequest.employee_id = this.employeeId; // ✅ Set in model
        console.log(this.employeeId)
        this.getLeaveBalances();

      } else {
        console.error('Employee ID not found in route!');
      }
    });
    this.payrollService.getLeaveTypeDropdowns().subscribe({
      next: (response: any) => {
        this.leaveTypes = response?.data?.leave_types || [];
        this.calculationMethods = response?.data?.calculation_methods || [];
        this.terminationOptions = response?.data?.termination_options || [];
      },
      error: (err) => {
        console.error('Failed to load leave types:', err);
      }
    });
  }

  toggleDropdown(dropdown: string) {
    if (dropdown === '3') this.dropdown3Open = !this.dropdown3Open;
    if (dropdown === '4') this.dropdown4Open = !this.dropdown4Open;
    if (dropdown === '5') this.dropdown5Open = !this.dropdown5Open;
  }

  openModal(modalId: string) {
    this.activeModal = modalId;
    this.closeAllDropdowns();
  }

  closeModal() {
    this.activeModal = null;
  }

  closeAllDropdowns() {
    this.dropdown3Open = false;
    this.dropdown4Open = false;
    this.dropdown5Open = false;
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.closeAllDropdowns();
    }
  }

  submitLeaveAssignment() {
    this.isLoading = true;

    const payload = {
      employee_id: this.employeeId,
      leave_type_id: +this.selectedLeave,
      leave_cat: 'Paid Leave',
      leave_calculation_method_id: +this.selectedCalculationMethod,
      hours_accured_annually: this.hoursAccruedAnnually,
      termination_unused_balnce: this.selectedTerminationOption,
      company_id: this.companyId  // ✅ Add this

    };

    this.payrollService.assignLeaveType(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.snackBar.open(res.message || 'Success', 'Close', {
          duration: 3000
        });
        this.resetForm();       // ✅ Clear form
        this.closeModal();
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err?.error?.message || 'Something went wrong!';
        this.snackBar.open(msg, 'Close', {
          duration: 5000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }
  resetForm(): void {
    this.selectedLeave = '';
    this.selectedCalculationMethod = '';
    this.hoursAccruedAnnually = null;
    this.openingBalance = null;
    this.hours = null;
    this.selectedTerminationOption = '';
  }

  getLeaveBalances(): void {
    this.payrollService.getLeaveBalancesByEmployeeId(this.employeeId).subscribe({
      next: (res: any) => {
        if (res.success && Array.isArray(res.data)) {
          this.leaveBalances = res.data;
        } else {
          console.warn('Unexpected leave balances response:', res);
        }
      },
      error: (err) => {
        console.error('Error fetching leave balances:', err);
      }
    });
  }

  // submit createLeaveRequest 
  submitLeaveRequest() {
    this.isLoading = true;
    this.formErrors = {};

    const payload = {
      employee_id: this.employeeId,
      leave_type_id: this.leaveRequest.leave_type,
      description: this.leaveRequest.description,
      start_date: this.leaveRequest.start_date,
      end_date: this.leaveRequest.end_date,
      pay_period_hours: this.leaveRequest.pay_period_hours || null,
    };

    this.payrollService.createLeaveRequest(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.snackBar.open(res.message || 'Leave request submitted', 'Close', { duration: 3000 });
        this.resetLeaveRequestForm();
        this.closeModal();
      },
      error: (err) => {
        this.isLoading = false;
        if (err?.error?.errors) {
          this.formErrors = err.error.errors;
        }

        const msg = err?.error?.message || 'Failed to submit leave request.';
        this.snackBar.open(msg, 'Close', {
          duration: 4000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }


  resetLeaveRequestForm() {
    this.leaveRequest = {
      employee_id: this.employeeId,
      leave_type: '',
      description: '',
      start_date: '',
      end_date: '',
      pay_period_hours: ''
    };
  }

}

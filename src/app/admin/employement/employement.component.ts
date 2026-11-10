import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import {
  PayrollService,
  Employees,
  ApiSingleResponse
} from 'src/app/services/payroll.service';
import { EmployeeContractInformation, SuperannuationMembership } from 'src/app/services/payroll.service';

import { EmployesStorsServiceService } from 'src/app/services/employes-stors-service.service';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-employement',
  templateUrl: './employement.component.html',
  styleUrls: ['./employement.component.scss']
})
export class EmployementComponent implements OnInit {
  editingIndex: number | null = null;
  incomeTypes: any[] = [];
  employmentBasisList: any[] = [];
  payFrequencies: any[] = [];
  employeeGroups: any[] = [];
  holidayGroups: any[] = [];
  ordinaryEarningsRates: any[] = [];

  employee: Employees | null = null;
  employeeForm!: FormGroup;
  memberships: { fund: string; number: string }[] = [];
  membershipForm!: FormGroup;
  employeeId?: number;

  showModal = false;
  showHistory = false;
  isLoading = false; // Add loading state
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private employeeStore: EmployesStorsServiceService,
    private payrollService: PayrollService
  ) { }

  ngOnInit(): void {
    this.getemployeedropdown();

    this.route.parent?.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (id) {
        this.employeeId = Number(id);
        this.getEmployeeContractInformation(this.employeeId);
      }
    });

    this.employee = this.employeeStore.getEmployee();
    this.initForm();
    this.initMembershipForm();

    if (this.employee) {
      this.setEmployeeData(this.employee);
    }
  }

  private initForm(): void {
    this.employeeForm = this.fb.group({
      employment_type: ['', Validators.required],
      income_type: ['', Validators.required],
      employment_basis: ['', Validators.required],
      start_date: ['', Validators.required],
      classification: [''],
      pay_frequency: ['', Validators.required],
      employee_group: [''],
      holiday_group: [''],
      include_holidays_in_payslips: [false],
      ordinary_earnings_rate: ['', Validators.required],
      authorised_to_approve_leave: [false],
      authorised_to_approve_timesheets: [false],
      notes: ['']
    });
  }

  private initMembershipForm(): void {
    this.membershipForm = this.fb.group({
      fund: ['', Validators.required],
      number: ['', Validators.required]
    });
  }

  private setEmployeeData(emp: Employees): void {
    const formattedStartDate = emp.start_date
      ? new Date(emp.start_date).toISOString().split('T')[0]
      : '';

    this.employeeForm.patchValue({
      ...emp,
      start_date: formattedStartDate
    });

    if (emp.superannuation_memberships) {
      this.memberships = emp.superannuation_memberships.map((m) => ({
        fund: m.fund_name,
        number: m.member_number
      }));
    }
  }
  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();  // <-- This ensures error messages show
      return;
    }
    if (this.employeeForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Form Invalid',
        text: 'Please fill all required fields before saving!'
      });
      return;
    }
    this.isLoading = true; // Set loading to true when submission starts
    const formData = this.employeeForm.value;

    const payload: EmployeeContractInformation = {
      employee_id: this.employee?.employee_id!, // Non-null assertion since ID is required
      employment_type: formData.employment_type,
      income_type: formData.income_type,
      employment_basis: formData.employment_basis,
      start_date: formData.start_date,
      classification: formData.classification || '',
      pay_frequency: formData.pay_frequency,
      employee_group: formData.employee_group || '',
      holiday_group: formData.holiday_group || '',
      include_holidays_in_payslips: formData.include_holidays_in_payslips,
      ordinary_earnings_rate: formData.ordinary_earnings_rate,
      authorised_to_approve_leave: formData.authorised_to_approve_leave,
      authorised_to_approve_timesheets: formData.authorised_to_approve_timesheets,
      authorised_fields: 'payroll,leave,timesheets', // or compute dynamically if needed
      notes: formData.notes || '',
      superannuation_memberships: this.memberships.map(m => ({
        fund_name: m.fund,
        member_number: m.number,
        fund_code: 'AUS001' // static or dynamic if needed
      })),
      emp_first_name: this.employee?.first_name,
      emp_last_name: this.employee?.last_name,
      emp_company_id: this.employee?.emp_company_id
    };

    console.log('Submitting payload:', payload);

    this.payrollService.putEmployeeContractInformation(payload).subscribe({
      next: (response) => {
        this.isLoading = false; // Reset loading state
        if (response.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: response.message || 'Employment details updated successfully!',
            timer: 1500,
            toast: true,
            position: 'top-end',
            showConfirmButton: false
          });

          this.employeeForm.markAsPristine();
          this.closeModal();
        } else {
          let errorMessages = '';
          if (response.errors) {
            for (const field in response.errors) {
              if (response.errors.hasOwnProperty(field)) {
                errorMessages += `${field}: ${response.errors[field].join(', ')}\n`;
              }
            }
          }

          Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: errorMessages || response.message || 'Failed to update employee info.'
          });
        }
      },
      error: (err) => {
        this.isLoading = false; // Reset loading state on error
        console.error('Error updating employee info:', err);
        Swal.fire({
          icon: 'error',
          title: 'Server Error',
          text: err.error?.message || 'Something went wrong.'
        });
      }
    });
  }

  private getFundCodeByName(fundName: string): string {
    // Example static mapping – adjust as needed
    const fundCodes: Record<string, string> = {
      'Australian Super': 'AUS001',
      'HESTA': 'HES001'
    };
    return fundCodes[fundName] || '';
  }

  private getAuthorisedFields(): string {
    const fields = [];
    if (this.employeeForm.value.authorised_to_approve_leave) fields.push('leave');
    if (this.employeeForm.value.authorised_to_approve_timesheets) fields.push('timesheets');
    return fields.length ? fields.join(',') : 'payroll';
  }


  private getFundCode(fundName: string): string {
    const fundCodes: { [key: string]: string } = {
      'Australian Super': 'AUS001',
      HESTA: 'HESTA001'
      // Add more mappings if needed
    };
    return fundCodes[fundName] || '';
  }

  openModal(index?: number): void {
    if (index !== undefined) {
      this.editingIndex = index;
      const membership = this.memberships[index];
      this.membershipForm.patchValue({
        fund: membership.fund,
        number: membership.number
      });
    } else {
      this.editingIndex = null;
      this.membershipForm.reset();
    }

    this.showModal = true;
  }

  // openModal() {
  //   this.membershipForm.reset();
  //   this.showModal = true;
  // }

  closeModal() {
    this.showModal = false;
  }

  addMembership(): void {
    if (this.membershipForm.valid) {
      const membership = this.membershipForm.value;

      if (this.editingIndex !== null) {
        // Update existing membership
        this.memberships[this.editingIndex] = membership;
      } else {
        // Add new membership
        this.memberships.push(membership);
      }

      this.editingIndex = null;
      this.membershipForm.reset();
      this.closeModal();
    }
  }


  deleteMembership(index: number) {
    this.memberships.splice(index, 1);
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  getEmployeeContractInformation(employeeId: number): void {
    this.payrollService.getEmployeecontractinformation(employeeId).subscribe({
      next: (res) => {
        this.employee = res.data;
        this.employeeStore.setEmployee(this.employee);
        this.setEmployeeData(this.employee);
      },
      error: (err) =>
        console.error('Error fetching employee contract information:', err)
    });
  }

  getemployeedropdown(): void {
    this.payrollService.getEmployeeDropdowns().subscribe({
      next: (res) => {
        const data = res.data;
        this.incomeTypes = data.income_type;
        this.employmentBasisList = data.employment_basis;
        this.payFrequencies = data.pay_frequency;
        this.employeeGroups = data.employee_group;
        this.holidayGroups = data.holiday_group;
        this.ordinaryEarningsRates = data.ordinary_earnings_rate;
      },
      error: (err) => {
        console.error('Failed to fetch dropdowns:', err);
      }
    });
  }

  private handleApiErrors(response: ApiSingleResponse<Employees>): void {
    let errorMessages = '';
    if (response.errors) {
      for (const field in response.errors) {
        if (response.errors.hasOwnProperty(field)) {
          errorMessages += `${field}: ${response.errors[field].join(', ')}\n`;
        }
      }
    }
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: errorMessages || response.message || 'Failed to save employment details.'
    });
  }
}

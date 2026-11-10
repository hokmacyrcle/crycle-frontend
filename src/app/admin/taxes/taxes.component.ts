import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { PayrollService, Employees, Tax } from 'src/app/services/payroll.service';
import { EmployesStorsServiceService } from 'src/app/services/employes-stors-service.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-taxes',
  templateUrl: './taxes.component.html',
  styleUrls: ['./taxes.component.scss']
})
export class TaxesComponent implements OnInit {
  employee: Employees | null = null;
  employeeForm!: FormGroup;
  employeeId?: number;
  hasTaxData = false;

  historyOpen = false;
  dropdownOpen = false;

  constructor(
    private fb: FormBuilder,
    private employeeStore: EmployesStorsServiceService,
    private payrollService: PayrollService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();
    const id = this.route.parent?.snapshot.paramMap.get('id');
    if (id) {
      this.employeeId = Number(id);
      this.fetchEmployeeTaxData(this.employeeId);
    }

    // Load employee from store
    this.employee = this.employeeStore.getEmployee();
    if (this.employee) {
      this.setEmployeeData(this.employee);
    }
  }

  private setEmployeeData(emp: Employees): void {
    const formattedStartDate = emp.start_date
      ? new Date(emp.start_date).toISOString().split('T')[0]
      : '';

    this.employeeForm.patchValue({
      ...emp,
      start_date: formattedStartDate
    });
  }

  private initForm(): void {
    this.employeeForm = this.fb.group({
      employee_id: [''],
      tax_file_number: ['', Validators.required],
      tfn_exemption: [''],
      residency_status: ['', Validators.required],
      has_approved_withholding_variation: [false],
      tax_scale_type: ['', Validators.required],
      has_study_training_loans: [false],
      claim_tax_free_threshold: [false],
      other_tax_offset_claimed: [''],
      tax_offset_amount: [''],
      increase_tax_withheld: [false],
      additional_tax_withheld: [''],
      eligible_for_leave_loading: [false],
      tax_notes: [''],

      variation_reason: [''], // UI only
      increase_tax_withheld_amount: [''],  // UI only
      leave_loading_percentage: [false],  // UI only
    });
  }

  private fetchEmployeeTaxData(empId: number): void {
    this.payrollService.getEmployeeTaxId(empId).subscribe({
      next: (res) => {
        if (res?.data) {
          const taxData: Tax = res.data;
          this.employeeForm.patchValue({
            tax_file_number: taxData.tax_file_number || '',
            tfn_exemption: taxData.tfn_exemption || '',
            residency_status: taxData.residency_status || '',
            has_approved_withholding_variation: !!taxData.has_approved_withholding_variation,
            tax_scale_type: taxData.tax_scale_type || '',
            has_study_training_loans: !!taxData.has_study_training_loans,
            claim_tax_free_threshold: !!taxData.claim_tax_free_threshold,
            other_tax_offset_claimed: taxData.other_tax_offset_claimed || '',
            tax_offset_amount: taxData.tax_offset_amount || '',
            increase_tax_withheld: !!taxData.increase_tax_withheld,
            additional_tax_withheld: taxData.additional_tax_withheld || '',
            eligible_for_leave_loading: !!taxData.eligible_for_leave_loading,
            tax_notes: taxData.tax_notes || '',

            variation_reason: taxData.variation_reason || '',  // UI only
            increase_tax_withheld_amount: taxData.increase_tax_withheld_amount || '',  // UI only
            leave_loading_percentage: taxData.leave_loading_percentage || '',  // UI only
          });
          this.hasTaxData = true;
        } else {
          this.hasTaxData = false;
        }
      },
      error: (err) => {
        console.error('Error fetching employee tax data:', err);
        this.hasTaxData = false;
      }
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();  // show errors
      Swal.fire({
        icon: 'warning',
        title: 'Form Invalid',
        text: 'Please fill required fields correctly before saving!'
      });
      return;
    }

    const form = this.employeeForm.value;

    const taxPayload: Tax = {
      employee_id: this.employeeId!,   // use the id from route
      tax_file_number: String(form.tax_file_number || ''),
      tfn_exemption: form.tfn_exemption || null,
      residency_status: form.residency_status,
      has_approved_withholding_variation: form.has_approved_withholding_variation,
      tax_scale_type: form.tax_scale_type || null,
      has_study_training_loans: form.has_study_training_loans,
      claim_tax_free_threshold: form.claim_tax_free_threshold,
      other_tax_offset_claimed: form.other_tax_offset_claimed,
      tax_offset_amount: String(form.tax_offset_amount || ''),
      increase_tax_withheld: form.increase_tax_withheld,
      additional_tax_withheld: String(form.additional_tax_withheld || ''),
      eligible_for_leave_loading: form.eligible_for_leave_loading,
      tax_notes: form.tax_notes
    };

    if (form.has_approved_withholding_variation) {
      taxPayload.variation_reason = form.variation_reason;
      taxPayload.increase_tax_withheld_amount = String(form.increase_tax_withheld_amount || '');
    }

    if (form.eligible_for_leave_loading) {
      taxPayload.leave_loading_percentage = form.leave_loading_percentage || '';
    }

    // Pass ID with payload
    this.payrollService.updateEmployeeTax(this.employeeId!, taxPayload).subscribe({
      next: (response) => {
        console.log('API Response:', response);

        if (response?.success === true || response?.status === true) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: response.message || 'Tax details updated successfully!',
            timer: 1500,
            toast: true,
            position: 'top-end',
            showConfirmButton: false
          });
          this.employeeForm.markAsPristine();
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
            title: 'Save Failed',
            text: errorMessages || response.message || 'Failed to update employee tax data.'
          });
        }
      }
    });

  }


  toggleSection() {
    this.historyOpen = !this.historyOpen;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeAllDropdowns() {
    this.dropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.closeAllDropdowns();
    }
  }
}

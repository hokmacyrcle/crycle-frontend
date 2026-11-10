import { Component, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { EmployeeService, Employee } from 'src/app/services/employee.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss']
})
export class AddEmployeeComponent implements OnInit {
  employeeForm!: FormGroup;
  submitted = false;
  isEditMode = false;
  isSubmitting = false;
  isDialog: boolean = false;
  employeeId: number | null = null;
  serverErrors: { [key: string]: string[] } = {};

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    @Optional() private dialogRef: MatDialogRef<AddEmployeeComponent>
  ) {
    this.isDialog = !!dialogRef;
  }
  ngOnInit(): void {
    this.initForm();

    // 🔁 This will get called on every route param change
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.employeeId = +params['id'];
        this.isEditMode = true;
        this.loadEmployee(this.employeeId);
      } else {
        this.employeeId = null;
        this.isEditMode = false;
      }
    });
  }



  initForm() {
    this.employeeForm = this.fb.group({
      emp_first_name: ['', Validators.required],
      emp_middle_name: [''],
      emp_last_name: ['', Validators.required],
      emp_gender: [''],
      emp_email_address: ['', [Validators.required, Validators.email]],
      emp_phone_number: [''],
      emp_mobile_number: [''],
      emp_company_id: ['', Validators.required],
      emp_status: ['Active'],
      emp_designation_id: [null],
      emp_start_date: [''],
      emp_resignation_date: [''],
      emp_last_working_date: [''],
      emp_termination_date: [''],
      emp_contract_end_date: [''],
      emp_tfn: [''],
      emp_work_authorization: [''],
      emp_visa_subclass: [''],
      emp_visa_expiry_date: [''],
      emp_employment_type: [''],
      emp_address_line_1: [''],
      emp_address_line_2: [''],
      emp_address_line_3: [''],
      emp_city: [''],
      emp_state: [''],
      emp_post_code: [''],
      emp_country: ['']
    });
  }
  formatDateForInput(dateString: string | null | undefined): string | null {
    if (!dateString) return null;
    return dateString.split('T')[0];  // Take only the date part before 'T'
  }

  loadEmployee(id: number) {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.employeeForm.patchValue({
            emp_first_name: response.data.emp_first_name,
            emp_middle_name: response.data.emp_middle_name,
            emp_last_name: response.data.emp_last_name,
            emp_gender: response.data.emp_gender,
            emp_email_address: response.data.emp_email_address,
            emp_phone_number: response.data.emp_phone_number,
            emp_mobile_number: response.data.emp_mobile_number,
            emp_company_id: response.data.emp_company_id,
            emp_status: response.data.emp_status,
            emp_designation_id: response.data.emp_designation_id,

            // emp_start_date: response.data.emp_start_date,
            // emp_resignation_date: response.data.emp_resignation_date,
            // emp_last_working_date: response.data.emp_last_working_date,
            // emp_termination_date: response.data.emp_termination_date,
            // emp_contract_end_date: response.data.emp_contract_end_date,

            emp_start_date: this.formatDateForInput(response.data.emp_start_date),
            emp_resignation_date: this.formatDateForInput(response.data.emp_resignation_date),
            emp_last_working_date: this.formatDateForInput(response.data.emp_last_working_date),
            emp_termination_date: this.formatDateForInput(response.data.emp_termination_date),
            emp_contract_end_date: this.formatDateForInput(response.data.emp_contract_end_date),
            emp_visa_expiry_date: this.formatDateForInput(response.data.emp_visa_expiry_date),


            emp_tfn: response.data.emp_tfn,
            emp_work_authorization: response.data.emp_work_authorization,
            emp_visa_subclass: response.data.emp_visa_subclass,
            // emp_visa_expiry_date: response.data.emp_visa_expiry_date,
            emp_employment_type: response.data.emp_employment_type,
            emp_address_line_1: response.data.emp_address_line_1,
            emp_address_line_2: response.data.emp_address_line_2,
            emp_address_line_3: response.data.emp_address_line_3,
            emp_city: response.data.emp_city,
            emp_state: response.data.emp_state,
            emp_post_code: response.data.emp_post_code,
            emp_country: response.data.emp_country,
          });
        }
      },
      error: (error) => {
        console.error('Failed to load employee', error);
      }
    });
  }



  onSubmit(): void {
    this.submitted = true;
    if (this.employeeForm.invalid) return;

    this.isSubmitting = true;
    const request = this.employeeId
      ? this.employeeService.updateEmployee(this.employeeId, this.employeeForm.value)
      : this.employeeService.createEmployee(this.employeeForm.value);

    request.subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.status === true) {
          Swal.fire({
            icon: 'success',
            title: this.employeeId ? 'Employee Updated' : 'Employee Added',
            text: response.message || 'Employee saved successfully.',
            timer: 1500,
            toast: true,
            position: 'top-end',
            showConfirmButton: false
          });

          this.isDialog ? this.dialogRef?.close('saved') : this.router.navigate(['/admin/employees']);
        } else {
          this.handleValidationErrors(response.errors, response.message);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        if (error.status === 422 && error.error?.errors) {
          this.handleValidationErrors(error.error.errors, error.error.message);
        } else {
          Swal.fire('Error', 'Failed to save employee.', 'error');
        }
      }
    });
  }

  handleValidationErrors(errors: any, message?: string) {
    let errorMessages = '';
    if (errors) {
      for (const field in errors) {
        if (errors.hasOwnProperty(field)) {
          errorMessages += errors[field].join(' ') + '\n';
        }
      }
      this.serverErrors = errors;
    }
    Swal.fire({
      icon: 'error',
      title: 'Validation Failed',
      text: errorMessages || message || 'Validation error occurred'
    });
  }

  onClose(): void {
    this.isDialog ? this.dialogRef?.close() : this.router.navigate(['/admin/employees']);
  }
}

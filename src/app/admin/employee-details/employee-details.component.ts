import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ApiSingleResponse, EmployeePayrollDetailsModel, PayrollService } from 'src/app/services/payroll.service';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.scss']
})
export class EmployeeDetailsComponent implements OnInit {
  employee?: EmployeePayrollDetailsModel;
  employeeForm!: FormGroup;
  showHistory = false;
  profilePicFile?: File;
  employeeId!: number;

  constructor(
    private fb: FormBuilder, private route: ActivatedRoute,
    private payrollService: PayrollService
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.route.parent?.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (id) {
        this.employeeId = +id;
        this.loadEmployee(this.employeeId);
      } else {
        console.error('Employee ID not found in route!');
      }
    });
  }

  private loadEmployee(empId: number): void {
    this.payrollService.getEmployeeById(empId).subscribe({
      next: (resp: ApiSingleResponse<EmployeePayrollDetailsModel>) => {
        if (resp.status && resp.data) {
          this.employee = resp.data;
          this.setEmployeeData(this.employee);
        } else {
          console.error('Failed to load employee');
        }
      },
      error: (err) => {
        console.error('Error loading employee:', err);
      }
    });
  }



  get profilePicUrl(): string | null {
    const pic = this.employee?.profile_pic;
    return typeof pic === 'string' ? pic : null;
  }

  private initForm(): void {
    this.employeeForm = this.fb.group({
      emp_title: [''],
      emp_first_name: ['', Validators.required],
      emp_middle_name: [''],
      emp_last_name: ['', Validators.required],
      emp_date_of_birth: [''],
      emp_job_title: [''],
      emp_address_search: [''],
      emp_xero_me_invitation: [false],
      emp_gender: ['', Validators.required],
      emp_company_id: [null, Validators.required],
      emp_status: [''],
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
      emp_country: [''],
      emp_mobile_number: [''],
      emp_phone_number: [''],
      emp_email_address: ['', [Validators.email]],
      emp_emergency_contact_name: [''],
      emp_emergency_contact_relationship: [''],
      emp_emergency_contact_phone: [''],
      emp_emergency_contact_email: ['', [Validators.email]],

    });
  }

  private setEmployeeData(emp: EmployeePayrollDetailsModel): void {
    this.employeeForm.patchValue({
      ...emp,
      emp_date_of_birth: emp.emp_date_of_birth ? emp.emp_date_of_birth.substring(0, 10) : '',
      emp_xero_me_invitation: emp.emp_xero_me_invitation ?? false
    });
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.profilePicFile = event.target.files[0];
      console.log(this.profilePicFile);
    }
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Form Invalid',
        text: 'Please fill required fields correctly before saving!'
      });
      return;
    }

    const updatedData: any = {};

    Object.keys(this.employeeForm.controls).forEach(key => {
      const control = this.employeeForm.get(key);
      if (control && control.dirty) {
        updatedData[key] = control.value;
      }
    });

    // Ensure required fields are included even if not dirty
    ['emp_first_name', 'emp_last_name', 'emp_company_id'].forEach(field => {
      if (!(field in updatedData)) {
        const val = this.employeeForm.get(field)?.value;
        if (val !== null && val !== undefined && val !== '') {
          updatedData[field] = val;
        }
      }
    });

    // If any required field is missing or empty, abort early
    for (const requiredField of ['emp_first_name', 'emp_last_name', 'emp_company_id']) {
      if (!updatedData[requiredField]) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: `${requiredField.replace(/_/g, ' ')} is required.`
        });
        return;
      }
    }

    if (this.profilePicFile) {
      // updatedData.profile_pic = this.profilePicFile;
      updatedData.profile_image = this.profilePicFile; // match backend field name!

    }

    if (Object.keys(updatedData).length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Changes',
        text: 'No changes detected to update.'
      });
      return;
    }

    const empId = this.employee?.employee_id;
    if (!empId) {
      Swal.fire({
        icon: 'error',
        title: 'No Employee ID',
        text: 'Employee ID is missing.'
      });
      return;
    }

    let payload: any = updatedData;
    if (updatedData.profile_pic instanceof File) {
      payload = new FormData();
      Object.entries(updatedData).forEach(([k, v]) => {
        if (v instanceof File) {
          payload.append(k, v);
        } else if (v !== null && v !== undefined) {
          payload.append(k, v.toString());
        }
      });

      // DEBUG: Log FormData contents
      for (const pair of payload.entries()) {
        console.log(`FormData: ${pair[0]} = ${pair[1]}`);
      }
    }

    this.payrollService.putEmployee(empId, payload).subscribe({
      next: (resp) => {
        if (resp.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: resp.message || 'Employee updated successfully!',
            toast: true,
            position: 'top-end',
            timer: 1500,
            showConfirmButton: false
          });
          this.employeeForm.markAsPristine();
        } else {
          let errs = '';
          if (resp.errors) {
            Object.entries(resp.errors).forEach(([fld, errsArr]) => {
              errs += `${fld}: ${errsArr.join(', ')}\n`;
            });
          }
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: errs || resp.message || 'Failed to update employee.'
          });
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Server Error',
          text: err.error?.message || 'Something went wrong while updating employee.'
        });
      }
    });
  }



  toggleHistory(): void {
    this.showHistory = !this.showHistory;
  }
}

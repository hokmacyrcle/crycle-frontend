import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CompaniesService } from 'src/app/services/companies.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.scss']
})
export class AddCompanyComponent implements OnInit {
  companyForm!: FormGroup;
  submitted = false;
  isSubmitting = false;
  serverErrors: { [key: string]: string[] } = {};
  companyTypes = ['Subscriber', 'Client'];

  constructor(
    private fb: FormBuilder,
    private companiesService: CompaniesService,
    private dialogRef: MatDialogRef<AddCompanyComponent>
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.companyForm = this.fb.group({
      company_name: ['', Validators.required],
      company_abn: ['', [Validators.pattern(/^\d{11}$/)]],
      company_acn: ['', [Validators.pattern(/^\d{9}$/)]],
      gst_registered: [false],
     primary_contact_person: [null],
      gst_number: [''],
      gst_registration_start_date: [''],
      company_registration_date: [''],
      company_type: ['Subscriber', Validators.required],

    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.companyForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    const payload = {
      ...this.companyForm.value,
 
    };

    this.companiesService.createCompany(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        if (response.status === true) {
          Swal.fire({
            icon: 'success',
            title: 'Company Added',
            text: response.message || 'New company has been successfully created.',
            timer: 1500,
            toast: true,
            position: 'top-end',
            showConfirmButton: false
          });

          this.dialogRef.close('saved');
        } else {
          let errorMessages = '';
          if (response.errors) {
            for (const field in response.errors) {
              if (response.errors.hasOwnProperty(field)) {
                errorMessages += response.errors[field].join(' ') + '\n';
              }
            }
          }

          Swal.fire({
            icon: 'error',
            title: 'Validation Failed',
            text: errorMessages || response.message || 'Validation error occurred'
          });

          this.serverErrors = response.errors;
        }
      },
      error: (error) => {
        this.isSubmitting = false;

        if (error.status === 422 && error.error?.errors) {
          let errorMessages = '';
          const errorsObj = error.error.errors;
          for (const field in errorsObj) {
            if (errorsObj.hasOwnProperty(field)) {
              errorMessages += errorsObj[field].join(' ') + '\n';
            }
          }

          Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: errorMessages || error.error.message || 'Please fix the errors.'
          });

          this.serverErrors = errorsObj;
        } else if (error.status === 403) {
          Swal.fire({
            icon: 'error',
            title: 'Unauthorized',
            text: 'You do not have permission to perform this action.'
          });
        } else {
          Swal.fire('Error', 'Failed to create company.', 'error');
        }
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
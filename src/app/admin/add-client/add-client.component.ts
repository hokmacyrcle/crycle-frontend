import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DashboardService } from 'src/app/services/dashboard.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.scss']
})
export class AddClientComponent {
clientForm!: FormGroup;
  submitted = false;
  isSubmitting = false;
  serverErrors: { [key: string]: string[] } = {}; // Holds dynamic backend validation errors
  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private dialogRef: MatDialogRef<AddClientComponent>
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.clientForm = this.fb.group({
      company_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      website: [''],
      vat_number: [''],
      gst_number: [''],
      address: [''],
      status: ['active'] // Default to active
    });
  }

  onSubmit(): void {
  this.submitted = true;

  if (this.clientForm.invalid) {
    return;
  }

  this.isSubmitting = true;

  this.dashboardService.createClient(this.clientForm.value).subscribe({
    next: (response) => {
      this.isSubmitting = false;

      if (response.status === true) {
        Swal.fire({
          icon: 'success',
          title: 'Client Added',
          text: response.message || 'New client has been successfully created.',
          timer: 1500,
          toast: true,
          position: 'top-end',
          showConfirmButton: false
        });

        this.dialogRef.close('saved');
      } else {
        // Handle validation errors returned with status false
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

        if (response.errors) {
          this.serverErrors = response.errors;
        }
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
      } else {
        Swal.fire('Error', 'Failed to create client.', 'error');
      }
    }
  });
}

  // onSubmit(): void {
  //   this.submitted = true;

  //   if (this.clientForm.invalid) {
  //     return;
  //   }

  //   this.isSubmitting = true;

  //   this.dashboardService.createClient(this.clientForm.value).subscribe({
  //     next: () => {
  //       Swal.fire({
  //         icon: 'success',
  //         title: 'Client Added',
  //         text: 'New client has been successfully created.',
  //         timer: 1500,
  //         toast: true,
  //         position: 'top-end',
  //         showConfirmButton: false
  //       });

  //       this.dialogRef.close('saved');
  //     },
  //     error: () => {
  //       Swal.fire('Error', 'Failed to create client.', 'error');
  //       this.isSubmitting = false;
  //     }
  //   });
  // }

  onClose(): void {
    this.dialogRef.close();
  }
}

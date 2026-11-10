import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { DashboardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-updateclient',
  templateUrl: './updateclient.component.html',
  styleUrls: ['./updateclient.component.scss']
})
export class UpdateclientComponent implements OnInit {
  clientId!: number;
  clientForm!: FormGroup;
  submitted = false;
  isSubmitting = false;
  serverErrors: { [key: string]: string[] } = {}; // Holds dynamic backend validation errors

  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientId = +this.route.snapshot.paramMap.get('id')!;
    this.initForm();

    this.dashboardService.getClientById(this.clientId).subscribe({
      next: (res) => this.clientForm.patchValue(res.data),
      error: () => {
        Swal.fire('Error', 'Failed to load client data.', 'error');
      }
    });
  }

  initForm() {
    this.clientForm = this.fb.group({
      company_name: ['', Validators.required],
      phone: ['', Validators.required],
      website: [''],
      vat_number: [''],
      gst_number: [''],
      address: [''],
      email: ['', [Validators.required, Validators.email]],
      status: ['']
    });
  }

  onSubmit() {
  this.submitted = true;
  this.serverErrors = {}; // Clear previous errors

  if (this.clientForm.invalid) {
    return;
  }

  this.isSubmitting = true;

  this.dashboardService.updateClient(this.clientId, this.clientForm.value).subscribe({
    next: (response) => {
      this.isSubmitting = false;

      if (response.status === true) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.message || 'Client updated successfully'
        }).then(() => {
          this.router.navigate(['/clients']);
        });
      } else {
        // If backend returns status false (validation failed)
        // Collect all error messages from errors object
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

        // Also assign errors to serverErrors for field-level display if needed
        if (response.errors) {
          this.serverErrors = response.errors;
        }
      }
    },

    error: (error) => {
      this.isSubmitting = false;

      if (error.status === 422 && error.error?.errors) {
        // Format validation errors from server
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
        Swal.fire('Error', 'Failed to update client.', 'error');
      }
    }
  });
}


}

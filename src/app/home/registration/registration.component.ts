import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService } from 'src/app/services/account.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  registerForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirmation: ['', Validators.required],
      phone: ['', [Validators.pattern('^[0-9]{10}$')]],
      countryCode: ['+91'],
      marketingOptIn: [true]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void { }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('passwordConfirmation')?.value
      ? null : { mismatch: true };
  }

onSubmit(): void {
  this.submitted = true;
  if (this.registerForm.invalid) {
    return;
  }

  this.isSubmitting = true;
  this.errorMessage = null;

  const formData = {
    first_name: this.registerForm.value.firstName,
    last_name: this.registerForm.value.lastName,
    email: this.registerForm.value.email,
    phone: this.registerForm.value.phone,
    country_code: this.registerForm.value.countryCode,
    password: this.registerForm.value.password,
    password_confirmation: this.registerForm.value.passwordConfirmation
  };

  this.accountService.register(formData).subscribe({
    next: (response) => {
      this.isSubmitting = false;
      this.submitted = false;

      console.log('status code:', response.status_code);

      if (response.status_code === 201) {
        // Success
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.message || 'User registered successfully',
          confirmButtonText: 'OK'
        }).then(() => {
          this.registerForm.reset({
            countryCode: '+91',
            marketingOptIn: true
          });
        });
      } else if (response.status_code === 400) {
        // Validation error (but received as HTTP 200)
        let errorMsg = response.message || 'Registration failed.';

        if (response.errors && typeof response.errors === 'object') {
          const errorFields = Object.entries(response.errors);
          if (errorFields.length > 0) {
            errorMsg = errorFields[0][1]; // First field error
          }
        }

        this.errorMessage = errorMsg;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
          confirmButtonText: 'OK'
        });
      } else {
        // Unknown or unexpected response
        Swal.fire({
          icon: 'warning',
          title: 'Unexpected Response',
          text: 'Received unexpected status_code: ' + response.status_code,
          confirmButtonText: 'OK'
        });
      }
    },

    error: (error) => {
      this.isSubmitting = false;

      console.error('HTTP Error:', error);

      let errorMsg = error.error?.message || 'Registration failed. Please try again.';

      if (error.error?.errors && typeof error.error.errors === 'object') {
        const errorFields = Object.entries(error.error.errors);
        if (errorFields.length > 0) {
          errorMsg = errorFields[0][1];
        }
      }

      this.errorMessage = errorMsg;

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
        confirmButtonText: 'OK'
      });
    }
  });
}
}
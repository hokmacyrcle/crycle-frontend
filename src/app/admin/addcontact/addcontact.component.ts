import { Component, Optional } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiResponse1, CustomersService } from 'src/app/services/customers.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-addcontact',
  templateUrl: './addcontact.component.html',
  styleUrls: ['./addcontact.component.scss']
})
export class AddcontactComponent {
 contactForm!: FormGroup;
  submitted = false;
  isEditMode = false;
  isSubmitting = false;
  isDialog: boolean = false;
  contactId: number | null = null;
  serverErrors: { [key: string]: string[] } = {};

  constructor(
    private fb: FormBuilder,
    private contactService: CustomersService,
    private router: Router,
    private route: ActivatedRoute,
    @Optional() private dialogRef: MatDialogRef<AddcontactComponent>
  ) {
    this.isDialog = !!dialogRef;
  }

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.contactId = +params['id'];
        this.isEditMode = true;
        this.loadContact(this.contactId);
      } else {
        this.contactId = null;
        this.isEditMode = false;
      }
    });
  }

  initForm() {
    this.contactForm = this.fb.group({
      company_id: ['', Validators.required],
      contact_type: ['', Validators.required],
      contact_first_name: ['', Validators.required],
      contact_middle_name: [''],
      contact_last_name: ['', Validators.required],
      contact_company_name: [''],
      contact_phone_number: [''],
      contact_mobile_number: [''],
      contact_email_address: ['', [Validators.required, Validators.email]],
      contact_address_line_1: [''],
      contact_address_line_2: [''],
      contact_address_line_3: [''],
      contact_city: [''],
      contact_state: [''],
      contact_post_code: [''],
      contact_country: [''],
      contact_category: ['', Validators.required],
      contact_status: ['Active', Validators.required],
      subscriber_client: [false],
      subscriber_id: [null]
    });
  }

  loadContact(id: number) {
    this.contactService.getContactById(id).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.contactForm.patchValue({
            company_id: response.data.company_id,
            contact_type: response.data.contact_type,
            contact_first_name: response.data.contact_first_name,
            contact_middle_name: response.data.contact_middle_name,
            contact_last_name: response.data.contact_last_name,
            contact_company_name: response.data.contact_company_name,
            contact_phone_number: response.data.contact_phone_number,
            contact_mobile_number: response.data.contact_mobile_number,
            contact_email_address: response.data.contact_email_address,
            contact_address_line_1: response.data.contact_address_line_1,
            contact_address_line_2: response.data.contact_address_line_2,
            contact_address_line_3: response.data.contact_address_line_3,
            contact_city: response.data.contact_city,
            contact_state: response.data.contact_state,
            contact_post_code: response.data.contact_post_code,
            contact_country: response.data.contact_country,
            contact_category: response.data.contact_category,
            contact_status: response.data.contact_status,
            subscriber_client: response.data.subscriber_client,
            subscriber_id: response.data.subscriber_id
          });
        }
      },
      error: (error) => {
        console.error('Failed to load contact', error);
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.contactForm.invalid) return;

    this.isSubmitting = true;
    const request = this.contactId
      ? this.contactService.updateContact(this.contactId, this.contactForm.value)
      : this.contactService.createContact(this.contactForm.value);

    request.subscribe({
      next: (response: ApiResponse1) => {
        this.isSubmitting = false;
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: this.contactId ? 'Contact Updated' : 'Contact Added',
            text: response.message || 'Contact saved successfully.',
            timer: 1500,
            toast: true,
            position: 'top-end',
            showConfirmButton: false
          });

          this.isDialog ? this.dialogRef?.close('saved') : this.router.navigate(['/admin/contacts']);
        } else {
          // this.handleValidationErrors(response.errors, response.message);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        if (error.status === 422 && error.error?.errors) {
          this.handleValidationErrors(error.error.errors, error.error.message);
        } else {
          Swal.fire('Error', 'Failed to save contact.', 'error');
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
    this.isDialog ? this.dialogRef?.close() : this.router.navigate(['/admin/contacts']);
  }
}
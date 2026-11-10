import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompaniesService } from 'src/app/services/companies.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-updatecompany',
  templateUrl: './updatecompany.component.html',
  styleUrls: ['./updatecompany.component.scss']
})
export class UpdatecompanyComponent implements OnInit {
  companyId!: number;
  companyForm!: FormGroup;
  submitted = false;
  isSubmitting = false;
  isLoading = true;
  isFormArrayReady = false; // New flag to track FormArray readiness
  serverErrors: { [key: string]: string[] } = {};

  constructor(
    private route: ActivatedRoute,
    private companiesService: CompaniesService,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.companyId = +this.route.snapshot.paramMap.get('id')!;
    this.initForm();

    this.companiesService.getCompanyById(this.companyId).subscribe({
      next: (res) => {
        // Patch company details
        this.companyForm.patchValue({
          company_name: res.data.company_name,
          company_abn: res.data.company_abn,
          company_acn: res.data.company_acn,
          gst_registered: res.data.gst_registered,
          gst_number: res.data.gst_number,
          gst_registration_start_date: res.data.gst_registration_start_date,
          company_registration_date: res.data.company_registration_date,
          company_type: res.data.company_type
        });

        // Populate locations FormArray
        const locations = this.companyForm.get('locations') as FormArray;
        locations.clear();
        console.log('FormArray cleared, length:', locations.length);

        if (res.data.locations && Array.isArray(res.data.locations) && res.data.locations.length > 0) {
          res.data.locations.forEach((location: any, index: number) => {
            const locationGroup = this.createLocationFormGroup();
            locationGroup.setValue({
              location_id: location.location_id || null,
              address_line_1: location.address_line_1 || '',
              address_line_2: location.address_line_2 || '',
              address_line_3: location.address_line_3 || '',
              city: location.city || '',
              state: location.state || '',
              postcode: location.postcode || '',
              country: location.country || '',
              location_status: location.location_status || 'Active'
            });
            locations.push(locationGroup);
          });
        } else {
          // No locations → create an empty one so UI can render it
          locations.push(this.createLocationFormGroup());
        }

        // Populate locations FormArray
        // const locations = this.companyForm.get('locations') as FormArray;
        // locations.clear();
        // console.log('FormArray cleared, length:', locations.length);

        // if (res.data.locations && Array.isArray(res.data.locations)) {
        //   res.data.locations.forEach((location: any, index: number) => {
        //     const locationGroup = this.createLocationFormGroup();
        //     locationGroup.setValue({
        //       location_id: location.location_id || null,
        //       address_line_1: location.address_line_1 || '',
        //       address_line_2: location.address_line_2 || '',
        //       address_line_3: location.address_line_3 || '',
        //       city: location.city || '',
        //       state: location.state || '',
        //       postcode: location.postcode || '',
        //       country: location.country || '',
        //       location_status: location.location_status || 'Active'
        //     });
        //     locations.push(locationGroup);
        //     console.log(`Location ${index} FormGroup value:`, locationGroup.value);
        //     console.log(`Location ${index} FormGroup valid:`, locationGroup.valid);
        //   });
        // } else {
        //   console.warn('No locations found in response:', res.data);
        // }

        // Debug form state
        console.log('API response locations:', res.data.locations);
        console.log('Form value after patching:', this.companyForm.value);
        console.log('Locations FormArray length:', locations.length);
        console.log('Locations FormArray values:', locations.controls.map(control => control.value));

        // Mark FormArray as ready and trigger rendering
        this.isFormArrayReady = true;
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          console.log('Form rendered, isLoading:', this.isLoading, 'isFormArrayReady:', this.isFormArrayReady);
        }, 100); // Increased delay to ensure DOM readiness
      },
      error: (err) => {
        console.error('Error fetching company data:', err);
        Swal.fire('Error', 'Failed to load company data.', 'error');
        this.isLoading = false;
        this.isFormArrayReady = false;
        this.cdr.detectChanges();
      }
    });
  }

  initForm() {
    this.companyForm = this.fb.group({
      company_name: ['', Validators.required],
      company_abn: ['', Validators.required],
      company_acn: ['', Validators.required],
      gst_registered: [false],
      gst_number: [''],
      gst_registration_start_date: [''],
      company_registration_date: [''],
      company_type: [''],
      locations: this.fb.array([])
    });
  }

  get locations() {
    return this.companyForm.get('locations') as FormArray;
  }

  createLocationFormGroup(): FormGroup {
    return this.fb.group({
      location_id: [null],
      address_line_1: ['', Validators.required],
      address_line_2: [''],
      address_line_3: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postcode: ['', Validators.required],
      country: ['', Validators.required],
      location_status: ['Active', Validators.required]
    });
  }

  addLocation() {
    const locations = this.locations;
    locations.push(this.createLocationFormGroup());
    console.log('Added new location. FormArray length:', locations.length);
    this.cdr.detectChanges();
  }

  removeLocation(index: number) {
    if (this.locations.length > 0) {
      this.locations.removeAt(index);
      console.log('Removed location. FormArray length:', this.locations.length);
      this.cdr.detectChanges();
    }
  }

  onSubmit() {
    this.submitted = true;
    this.serverErrors = {};

    if (this.companyForm.invalid) {
      console.warn('Form is invalid:', this.companyForm.errors);
      console.log('Form value on submit:', this.companyForm.value);
      return;
    }

    this.isSubmitting = true;

    this.companiesService.updateCompany(this.companyId, this.companyForm.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        if (response.status === true) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: response.message || 'Company updated successfully'
          }).then(() => {
            this.router.navigate(['/companies']);
          });
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
          Swal.fire('Error', 'Failed to update company.', 'error');
        }
      }
    });
  }
}
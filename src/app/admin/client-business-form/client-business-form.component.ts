import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { ClientBusinessService } from 'src/app/services/client-business.service';
import { abnValidator } from 'src/app/home/signup/signup.component';

@Component({
  selector: 'app-client-business-form',
  templateUrl: './client-business-form.component.html'
})
export class ClientBusinessFormComponent implements OnInit {
  id: string | null = null;
  busy = false;
  tried = false;
  error = '';
  states = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

  form = this.fb.group({
    name: ['', Validators.required],
    abn: ['', abnValidator],
    acn: ['', Validators.pattern(/^(\d{3}\s?\d{3}\s?\d{3})?$/)],
    gst: [false],
    address: ['', Validators.required],
    suburb: ['', Validators.required],
    state: ['', Validators.required],
    postcode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]]
  });

  constructor(private fb: FormBuilder, private api: ClientBusinessService, private route: ActivatedRoute,
              private router: Router, private alerts: AlertService) { }

  get editing(): boolean { return !!this.id; }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.api.get(this.id).subscribe({
        next: r => {
          if (!r?.status) { this.alerts.DangerSwalnew('Could not load this business', r?.message || ''); this.router.navigate(['/admin/companies']); return; }
          const c = r.data.company;
          this.form.patchValue({ name: c.company_name, abn: c.company_abn || '', acn: c.company_acn || '', gst: !!c.gst_registered,
            address: c.address_line || '', suburb: c.suburb || '', state: c.state || '', postcode: c.postcode || '' });
        },
        error: () => this.router.navigate(['/admin/companies'])
      });
    }
  }

  invalid(name: string): boolean { const c = this.form.get(name); return !!(this.tried && c && c.invalid); }

  submit(): void {
    this.tried = true; this.error = '';
    if (this.form.invalid) {
      this.error = 'Please fix the highlighted fields.';
      setTimeout(() => document.querySelector('.border-red-600')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50);
      return;
    }
    const v = this.form.value;
    const body = {
      company_name: v.name, company_abn: v.abn || null, company_acn: v.acn || null, gst_registered: !!v.gst,
      address_line: v.address, suburb: v.suburb, state: v.state, postcode: v.postcode
    };
    this.busy = true;
    const call = this.id ? this.api.update(this.id, body) : this.api.create(body);
    call.subscribe({
      next: r => {
        this.busy = false;
        if (r?.status) { this.router.navigate(['/admin/companies']); }
        else { this.error = this.firstError(r); }
      },
      error: e => { this.busy = false; this.error = this.firstError(e?.error) || 'Something went wrong. Please try again.'; }
    });
  }

  private firstError(r: any): string {
    const errs = r?.errors;
    if (errs && typeof errs === 'object') {
      const first: any = Object.values(errs)[0];
      return Array.isArray(first) ? first[0] : String(first);
    }
    return r?.message || '';
  }
}

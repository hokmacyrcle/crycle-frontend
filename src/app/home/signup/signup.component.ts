import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';

/** Same checksum as the backend ValidAbn rule. */
export function abnValidator(c: AbstractControl): ValidationErrors | null {
  const v = String(c.value || '').replace(/\s+/g, '');
  if (!v) return null;
  if (!/^\d{11}$/.test(v)) return { abn: true };
  const w = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const d = v.split('').map(Number);
  d[0] -= 1;
  return d.reduce((s, n, i) => s + n * w[i], 0) % 89 === 0 ? null : { abn: true };
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html'
})
export class SignupComponent {
  step = 1; // 1 account, 3 firm, 4 request access, 5 done (2 = email code, removed for now)
  dots = [1, 3, 4];
  get shown(): number { return this.dots.indexOf(this.step) + 1; }
  busy = false;
  error = '';
  tried = false;
  showPw = false;

  states = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];
  clientBands = ['1-10', '11-50', '51-200', '200+'];
  staffBands = ['1-3', '4-10', '11-25', '25+'];

  account = this.fb.group({
    firstName: ['', Validators.required],
    middleName: [''],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^0?4(\s?\d){8}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    passwordConfirmation: ['', Validators.required]
  }, { validators: (g: AbstractControl) => g.get('password')?.value === g.get('passwordConfirmation')?.value ? null : { mismatch: true } });

  firm = this.fb.group({
    firmName: ['', Validators.required],
    abn: ['', [Validators.required, abnValidator]],
    acn: ['', Validators.pattern(/^(\d{3}\s?\d{3}\s?\d{3})?$/)],
    state: ['', Validators.required],
    address: ['', Validators.required],
    suburb: ['', Validators.required],
    postcode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
    gst: [false]
  });

  access = this.fb.group({
    clients: ['', Validators.required],
    staff: ['', Validators.required],
    terms: [false, Validators.requiredTrue],
    marketing: [false]
  });

  constructor(private fb: FormBuilder, private api: AccountService, private router: Router) { }

  back(): void {
    this.error = ''; this.tried = false;
    if (this.step === 1) { this.router.navigate(['/login']); }
    else if (this.step === 3) { this.step = 1; }
    else if (this.step === 4) { this.step = 3; }
  }

  private notice(): void {
    this.error = 'Please fix the highlighted fields.';
    setTimeout(() => document.querySelector('.border-red-600')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50);
  }

  invalid(form: { get(n: string): AbstractControl | null }, name: string): boolean {
    const c = form.get(name);
    return !!(this.tried && c && c.invalid);
  }

  // Step 1
  submitAccount(): void {
    this.tried = true; this.error = '';
    if (this.account.invalid) { this.notice(); return; }
    const v = this.account.value;
    this.busy = true;
    this.api.register({
      first_name: v.firstName!, middle_name: v.middleName || '', last_name: v.lastName!,
      email: v.email!, phone: String(v.phone).replace(/\s+/g, '').replace(/^0/, ''), country_code: '+61',
      password: v.password!, password_confirmation: v.passwordConfirmation!, marketing_opt_in: false
    }).subscribe({
      next: r => {
        if (r.status_code === 201) {
          localStorage.setItem('access_token', r.data.access_token);
          localStorage.setItem('token_type', r.data.token_type || 'Bearer');
          localStorage.setItem('name', r.data.user?.name || '');
          this.busy = false;
          this.tried = false;
          this.step = 3;
        } else {
          this.busy = false;
          this.error = this.firstError(r);
        }
      },
      error: e => { this.busy = false; this.error = this.firstError(e.error) || 'Something went wrong. Please try again.'; }
    });
  }

  // Step 3
  submitFirm(): void {
    this.tried = true; this.error = '';
    if (this.firm.invalid) { this.notice(); return; }
    this.tried = false; this.step = 4;
  }

  // Step 4
  submitAccess(): void {
    this.tried = true; this.error = '';
    if (this.access.invalid) { this.notice(); return; }
    const f = this.firm.value, a = this.access.value;
    this.busy = true;
    this.api.registerFirm({
      firm_name: f.firmName, abn: f.abn, acn: f.acn || null, state: f.state, address_line: f.address, suburb: f.suburb, postcode: f.postcode,
      gst_registered: !!f.gst, client_count_band: a.clients, staff_count_band: a.staff, accept_terms: !!a.terms
    }).subscribe({
      next: r => { this.busy = false; if (r.status) { this.step = 5; } else { this.error = this.firstError(r); } },
      error: () => { this.busy = false; this.error = 'Something went wrong. Please try again.'; }
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

import { Component, OnDestroy } from '@angular/core';
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
export class SignupComponent implements OnDestroy {
  step = 1; // 1 account, 2 verify email, 3 firm, 4 request access, 5 done
  busy = false;
  error = '';
  tried = false;
  resendIn = 0;
  private timer: any;

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

  code = this.fb.control('', [Validators.required, Validators.pattern(/^\d{6}$/)]);

  firm = this.fb.group({
    firmName: ['', Validators.required],
    abn: ['', [Validators.required, abnValidator]],
    acn: ['', Validators.pattern(/^(\d{3}\s?\d{3}\s?\d{3})?$/)],
    state: ['', Validators.required],
    address: ['', Validators.required],
    gst: [false]
  });

  access = this.fb.group({
    clients: ['', Validators.required],
    staff: ['', Validators.required],
    terms: [false, Validators.requiredTrue],
    marketing: [false]
  });

  constructor(private fb: FormBuilder, private api: AccountService, private router: Router) {
    // Resume after a refresh: if a token exists, ask the server where the user is.
    if (localStorage.getItem('access_token')) {
      this.api.me().subscribe({
        next: r => {
          if (r?.data?.firm_status) { this.router.navigate(['/pending']); }
          else if (r?.data?.email_verified) { this.step = 3; }
        },
        error: () => { /* stale token: stay on step 1 */ }
      });
    }
  }

  ngOnDestroy(): void { clearInterval(this.timer); }

  back(): void {
    this.error = ''; this.tried = false;
    if (this.step === 1) { this.router.navigate(['/login']); }
    else if (this.step === 2) { this.step = 1; }
    else if (this.step > 2) { this.step -= 1; }
  }

  invalid(form: { get(n: string): AbstractControl | null }, name: string): boolean {
    const c = form.get(name);
    return !!(this.tried && c && c.invalid);
  }

  // Step 1
  submitAccount(): void {
    this.tried = true; this.error = '';
    if (this.account.invalid) return;
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
          this.tried = false;
          this.sendCode(true);
        } else {
          this.busy = false;
          this.error = this.firstError(r);
        }
      },
      error: e => { this.busy = false; this.error = this.firstError(e.error) || 'Something went wrong. Please try again.'; }
    });
  }

  // Step 2
  sendCode(advance = false): void {
    this.busy = true; this.error = '';
    this.api.sendEmailCode().subscribe({
      next: r => {
        this.busy = false;
        if (r.status) { if (advance) { this.step = 2; } this.startCooldown(); }
        else { this.error = r.message; if (advance) { this.step = 2; } }
      },
      error: () => { this.busy = false; this.error = 'We could not send the code. Please try again.'; if (advance) { this.step = 2; } }
    });
  }
  private startCooldown(): void {
    this.resendIn = 30; clearInterval(this.timer);
    this.timer = setInterval(() => { this.resendIn--; if (this.resendIn <= 0) clearInterval(this.timer); }, 1000);
  }
  submitCode(): void {
    this.tried = true; this.error = '';
    if (this.code.invalid) return;
    this.busy = true;
    this.api.verifyEmailCode(this.code.value!).subscribe({
      next: r => { this.busy = false; if (r.status) { this.tried = false; this.step = 3; } else { this.error = r.message; } },
      error: () => { this.busy = false; this.error = 'Something went wrong. Please try again.'; }
    });
  }

  // Step 3
  submitFirm(): void {
    this.tried = true; this.error = '';
    if (this.firm.invalid) return;
    this.tried = false; this.step = 4;
  }

  // Step 4
  submitAccess(): void {
    this.tried = true; this.error = '';
    if (this.access.invalid) return;
    const f = this.firm.value, a = this.access.value;
    this.busy = true;
    this.api.registerFirm({
      firm_name: f.firmName, abn: f.abn, acn: f.acn || null, state: f.state, address_line: f.address,
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

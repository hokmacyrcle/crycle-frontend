import { Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-forgot-password',
  template: `
<div class="mx-auto flex min-h-screen max-w-md flex-col bg-[#F6F4EC] text-cyrcle-navy">
  <div class="px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
    <button type="button" (click)="back()" aria-label="Back" class="flex h-11 w-11 items-center justify-center rounded-full bg-white"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#01153E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
  </div>

  <!-- 1 email -->
  <form *ngIf="step === 1" [formGroup]="emailForm" (ngSubmit)="sendCode()" class="flex flex-1 flex-col" novalidate>
    <div class="px-5 pt-5"><h1 class="m-0 text-[26px] font-extrabold leading-tight">Reset your password</h1><p class="mt-2 text-[15px] leading-snug text-[#3C4663]">Enter your email address and we will send you a 6-digit code.</p></div>
    <div class="px-5 pt-5">
      <label class="block"><div class="mb-1.5 text-[13px] font-bold">Email address</div>
        <input type="email" formControlName="email" autocomplete="username" class="h-[52px] w-full rounded-[14px] border-[1.5px] bg-white px-4 text-base outline-none focus:border-cyrcle-navy" [ngClass]="tried && emailForm.invalid ? 'border-red-600' : 'border-[#B9B39F]'">
        <div *ngIf="tried && emailForm.invalid" class="mt-1 text-xs font-semibold text-red-700">Enter a valid email address</div></label>
    </div>
    <div *ngIf="error" role="alert" class="mx-5 mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{{error}}</div>
    <div class="mt-auto px-4 pb-8 pt-6"><button type="submit" [disabled]="busy" class="flex h-[52px] w-full items-center justify-center rounded-full bg-cyrcle-poppy text-[15px] font-bold disabled:opacity-60">{{busy ? 'Please wait…' : 'Send code'}}</button></div>
  </form>

  <!-- 2 code -->
  <form *ngIf="step === 2" (ngSubmit)="verify()" class="flex flex-1 flex-col" novalidate>
    <div class="px-5 pt-5"><h1 class="m-0 text-[26px] font-extrabold leading-tight">Check your email</h1><p class="mt-2 text-[15px] leading-snug text-[#3C4663]">We sent a 6-digit code to <b>{{emailForm.value.email}}</b>.</p></div>
    <div class="flex flex-col gap-3.5 px-5 pt-5">
      <label class="block"><div class="mb-1.5 text-[13px] font-bold">Verification code</div>
        <input type="text" inputmode="numeric" maxlength="6" autocomplete="one-time-code" [formControl]="code" class="h-[60px] w-full rounded-[14px] border-[1.5px] bg-white px-4 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-cyrcle-navy" [ngClass]="tried && code.invalid ? 'border-red-600' : 'border-[#B9B39F]'">
        <div *ngIf="tried && code.invalid" class="mt-1 text-xs font-semibold text-red-700">Enter the 6-digit code</div></label>
      <button type="button" (click)="resend()" [disabled]="busy" class="self-start text-sm font-bold text-cyrcle-midnight underline">Send the code again</button>
    </div>
    <div *ngIf="error" role="alert" class="mx-5 mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{{error}}</div>
    <div class="mt-auto px-4 pb-8 pt-6"><button type="submit" [disabled]="busy" class="flex h-[52px] w-full items-center justify-center rounded-full bg-cyrcle-poppy text-[15px] font-bold disabled:opacity-60">{{busy ? 'Please wait…' : 'Continue'}}</button></div>
  </form>

  <!-- 3 new password -->
  <form *ngIf="step === 3" [formGroup]="pwForm" (ngSubmit)="reset()" class="flex flex-1 flex-col" novalidate>
    <div class="px-5 pt-5"><h1 class="m-0 text-[26px] font-extrabold leading-tight">Choose a new password</h1><p class="mt-2 text-[15px] leading-snug text-[#3C4663]">Use at least 8 characters.</p></div>
    <div class="flex flex-col gap-3.5 px-5 pt-5">
      <label class="block"><div class="mb-1.5 text-[13px] font-bold">New password</div>
        <div class="relative"><input [type]="showPw ? 'text' : 'password'" formControlName="password" autocomplete="new-password" class="h-[52px] w-full rounded-[14px] border-[1.5px] bg-white pl-4 pr-20 text-base outline-none focus:border-cyrcle-navy" [ngClass]="tried && pwForm.get('password')?.invalid ? 'border-red-600' : 'border-[#B9B39F]'">
        <button type="button" (click)="showPw = !showPw" class="absolute right-2 top-1/2 h-11 -translate-y-1/2 px-3 text-sm font-bold text-cyrcle-midnight">{{ showPw ? 'Hide' : 'Show' }}</button></div>
        <div *ngIf="tried && pwForm.get('password')?.invalid" class="mt-1 text-xs font-semibold text-red-700">Use at least 8 characters</div></label>
      <label class="block"><div class="mb-1.5 text-[13px] font-bold">Confirm new password</div>
        <input [type]="showPw ? 'text' : 'password'" formControlName="confirm" autocomplete="new-password" class="h-[52px] w-full rounded-[14px] border-[1.5px] bg-white px-4 text-base outline-none focus:border-cyrcle-navy" [ngClass]="tried && pwForm.errors?.['mismatch'] ? 'border-red-600' : 'border-[#B9B39F]'">
        <div *ngIf="tried && pwForm.errors?.['mismatch']" class="mt-1 text-xs font-semibold text-red-700">The two passwords do not match</div></label>
    </div>
    <div *ngIf="error" role="alert" class="mx-5 mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{{error}}</div>
    <div class="mt-auto px-4 pb-8 pt-6"><button type="submit" [disabled]="busy" class="flex h-[52px] w-full items-center justify-center rounded-full bg-cyrcle-poppy text-[15px] font-bold disabled:opacity-60">{{busy ? 'Please wait…' : 'Save new password'}}</button></div>
  </form>

  <!-- 4 done -->
  <div *ngIf="step === 4" class="flex flex-1 flex-col">
    <div class="px-5 pt-10"><h1 class="m-0 text-[26px] font-extrabold leading-tight">Password updated</h1><p class="mt-2 text-[15px] leading-snug text-[#3C4663]">You can now log in with your new password.</p></div>
    <div class="mt-auto px-4 pb-8 pt-6"><a routerLink="/login" class="flex h-[52px] items-center justify-center rounded-full bg-cyrcle-poppy text-[15px] font-bold">Log in</a></div>
  </div>
</div>`
})
export class ForgotPasswordComponent implements OnDestroy {
  step = 1; busy = false; error = ''; tried = false; showPw = false;

  emailForm = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  code = this.fb.control('', [Validators.required, Validators.pattern(/^\d{6}$/)]);
  pwForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required]
  }, { validators: (g: AbstractControl) => g.get('password')?.value === g.get('confirm')?.value ? null : { mismatch: true } });

  constructor(private fb: FormBuilder, private api: AccountService, private router: Router) { }
  ngOnDestroy(): void { }

  back(): void {
    this.error = ''; this.tried = false;
    if (this.step === 1 || this.step === 4) { this.router.navigate(['/login']); } else { this.step -= 1; }
  }

  sendCode(): void {
    this.tried = true; this.error = '';
    if (this.emailForm.invalid) return;
    this.busy = true;
    this.api.forgotSendOtp(this.emailForm.value.email!).subscribe({
      next: r => { this.busy = false; if (r.status) { this.tried = false; this.step = 2; } else { this.error = r.message; } },
      error: () => { this.busy = false; this.error = 'We could not send the code. Please try again.'; }
    });
  }

  resend(): void {
    this.busy = true; this.error = '';
    this.api.forgotSendOtp(this.emailForm.value.email!).subscribe({
      next: r => { this.busy = false; this.error = r.status ? '' : r.message; },
      error: () => { this.busy = false; this.error = 'We could not send the code. Please try again.'; }
    });
  }

  verify(): void {
    this.tried = true; this.error = '';
    if (this.code.invalid) return;
    this.busy = true;
    this.api.forgotVerifyOtp(this.emailForm.value.email!, this.code.value!).subscribe({
      next: r => { this.busy = false; if (r.status) { this.tried = false; this.step = 3; } else { this.error = r.message; } },
      error: () => { this.busy = false; this.error = 'Something went wrong. Please try again.'; }
    });
  }

  reset(): void {
    this.tried = true; this.error = '';
    if (this.pwForm.invalid) return;
    this.busy = true;
    const v = this.pwForm.value;
    this.api.forgotReset(this.emailForm.value.email!, v.password!, v.confirm!).subscribe({
      next: r => { this.busy = false; if (r.status) { this.step = 4; } else { this.error = r.message; } },
      error: () => { this.busy = false; this.error = 'Something went wrong. Please try again.'; }
    });
  }
}

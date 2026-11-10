import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-pending',
  template: `
<div class="mx-auto flex min-h-screen max-w-md flex-col bg-[#F6F4EC] px-5 pb-8 pt-[calc(env(safe-area-inset-top)+48px)] text-cyrcle-navy">
  <img src="assets/images/brand/cyrcle-mark.svg" alt="Cyrcle logo mark" class="mx-auto w-[120px]">
  <h1 class="mt-8 text-[26px] font-extrabold leading-tight">{{ title }}</h1>
  <p class="mt-2 text-[15px] leading-snug text-[#3C4663]">{{ body }}</p>
  <div *ngIf="error" role="alert" class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{{ error }}</div>
  <div class="mt-auto flex flex-col gap-2 pt-8">
    <button type="button" (click)="check()" [disabled]="busy" class="flex h-[52px] items-center justify-center rounded-full bg-cyrcle-poppy text-[15px] font-bold disabled:opacity-60">{{ busy ? 'Checking…' : 'Check again' }}</button>
    <button type="button" (click)="logout()" class="py-2 text-sm font-semibold text-cyrcle-midnight underline">Log out</button>
  </div>
</div>`
})
export class PendingComponent implements OnInit {
  busy = false;
  error = '';
  status = 'pending';

  constructor(private api: AccountService, private router: Router) { }

  get title(): string {
    return this.status === 'rejected' ? 'We could not approve your firm' : 'Your firm is under review';
  }
  get body(): string {
    return this.status === 'rejected'
      ? 'Please contact us so we can look at your details together.'
      : 'We will email you as soon as it is approved, usually within one business day.';
  }

  ngOnInit(): void { this.check(); }

  check(): void {
    this.busy = true; this.error = '';
    this.api.me().subscribe({
      next: r => {
        this.busy = false;
        const s = r?.data?.firm_status;
        if (s === 'pending' || s === 'rejected') { this.status = s; }
        else if (s === 'active' || s === null || s === undefined) {
          // Approved (or no pending firm): continue through the normal login so companies load.
          localStorage.clear();
          this.router.navigate(['/login']);
        } else { this.status = s; }
      },
      error: () => { this.busy = false; this.error = 'We could not check right now. Please try again.'; }
    });
  }

  logout(): void { localStorage.clear(); this.router.navigate(['/login']); }
}

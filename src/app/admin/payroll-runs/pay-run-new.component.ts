import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { toProblem } from '../sales/sales.service';
import { Frequency } from './payrun.models';
import { PayRunService } from './payrun.service';

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d: Date, n: number) => { const c = new Date(d); c.setDate(c.getDate() + n); return c; };

@Component({
  selector: 'app-pay-run-new',
  template: `
<div class="mx-auto max-w-xl">
  <a routerLink="/admin/payroll" class="inline-flex min-h-[40px] items-center gap-1 text-sm font-bold text-cyrcle-midnight"><app-icon name="arrow-left" [size]="16"></app-icon>Pay runs</a>
  <div class="m-0 mt-1 text-[22px] font-extrabold" role="heading" aria-level="2">New pay run</div>
  <p class="mt-1 text-sm text-[#3C4663]">Everyone who is paid on this schedule is added for you.</p>

  <form class="cy-card mt-4 flex flex-col gap-5" (ngSubmit)="save()" novalidate>
    <div *ngIf="banner" class="rounded-[12px] bg-[#FADBD8] px-4 py-3 text-sm font-bold text-[#9B1C1C]" role="alert">{{ banner }}</div>

    <fieldset class="m-0 border-0 p-0">
      <legend class="mb-2 text-sm font-bold">How often are they paid?</legend>
      <div class="grid grid-cols-3 gap-2">
        <label *ngFor="let f of freqs" class="flex min-h-[48px] cursor-pointer items-center justify-center rounded-[14px] border-[1.5px] px-2 text-sm font-bold"
               [ngClass]="frequency === f ? 'border-cyrcle-navy bg-cyrcle-navy text-white' : 'border-[#B9B39F] bg-white'">
          <input type="radio" name="freq" class="sr-only" [value]="f" [ngModel]="frequency" (ngModelChange)="setFrequency($event)">{{ f }}
        </label>
      </div>
      <div *ngIf="errors['frequency']" class="mt-1 text-[13px] font-bold text-[#9B1C1C]">{{ errors['frequency'] }}</div>
    </fieldset>

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="block"><span class="mb-1 block text-sm font-bold">First day of the period</span>
        <input type="date" name="start" class="cy-input" [(ngModel)]="start" [class.cy-input-error]="errors['period_start']">
        <span *ngIf="errors['period_start']" class="mt-1 block text-[13px] font-bold text-[#9B1C1C]">{{ errors['period_start'] }}</span></label>
      <label class="block"><span class="mb-1 block text-sm font-bold">Last day of the period</span>
        <input type="date" name="end" class="cy-input" [(ngModel)]="end" [class.cy-input-error]="errors['period_end']">
        <span *ngIf="errors['period_end']" class="mt-1 block text-[13px] font-bold text-[#9B1C1C]">{{ errors['period_end'] }}</span></label>
    </div>
    <label class="block"><span class="mb-1 block text-sm font-bold">Pay date</span>
      <input type="date" name="pay" class="cy-input sm:max-w-[240px]" [(ngModel)]="payDate" [class.cy-input-error]="errors['pay_date']">
      <span class="mt-1 block text-[13px] text-[#5B6478]">The day the money reaches your employees. Super is due within 7 business days after this.</span>
      <span *ngIf="errors['pay_date']" class="mt-1 block text-[13px] font-bold text-[#9B1C1C]">{{ errors['pay_date'] }}</span></label>

    <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <a routerLink="/admin/payroll" class="cy-btn-secondary justify-center">Cancel</a>
      <button type="submit" class="cy-btn-primary justify-center" [disabled]="busy">{{ busy ? 'Setting up…' : 'Create pay run' }}</button>
    </div>
  </form>
</div>`
})
export class PayRunNewComponent {
  freqs: Frequency[] = ['Weekly', 'Fortnightly', 'Monthly'];
  frequency: Frequency = 'Fortnightly';
  start = ''; end = ''; payDate = '';
  errors: Record<string, string> = {};
  banner = '';
  busy = false;

  constructor(private api: PayRunService, private router: Router) { this.setFrequency('Fortnightly'); }

  /** Suggests dates that line up with the most recent finished period. They can be changed. */
  setFrequency(f: Frequency): void {
    this.frequency = f;
    const now = new Date();
    const monday = addDays(now, -((now.getDay() + 6) % 7));
    let s: Date, e: Date;
    if (f === 'Weekly') { s = addDays(monday, -7); e = addDays(s, 6); }
    else if (f === 'Fortnightly') { s = addDays(monday, -14); e = addDays(s, 13); }
    else { s = new Date(now.getFullYear(), now.getMonth() - 1, 1); e = new Date(now.getFullYear(), now.getMonth(), 0); }
    this.start = iso(s); this.end = iso(e); this.payDate = iso(addDays(e, 3));
  }

  save(): void {
    this.errors = {}; this.banner = '';
    if (!this.start) this.errors['period_start'] = 'Enter the first day of the pay period.';
    if (!this.end) this.errors['period_end'] = 'Enter the last day of the pay period.';
    if (!this.payDate) this.errors['pay_date'] = 'Enter the pay date.';
    if (Object.keys(this.errors).length) return;
    this.busy = true;
    this.api.create({ frequency: this.frequency, period_start: this.start, period_end: this.end, pay_date: this.payDate }).subscribe({
      next: r => { this.busy = false; this.router.navigate(['/admin/payroll/runs', r.id]); },
      error: e => { this.busy = false; const p = toProblem(e); this.errors = p.fieldErrors; this.banner = p.message; }
    });
  }
}

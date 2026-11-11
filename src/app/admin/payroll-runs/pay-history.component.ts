import { Component, OnInit } from '@angular/core';
import { toProblem } from '../sales/sales.service';
import { History } from './payrun.models';
import { PayRunService } from './payrun.service';

@Component({
  selector: 'app-pay-history',
  template: `
<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <p class="m-0 text-sm text-[#3C4663]">What each employee has been paid, from finalised pay runs.</p>
  <label class="flex items-center gap-2 text-sm font-bold" *ngIf="h">Financial year
    <select class="cy-input !w-auto" [ngModel]="h.fy" (ngModelChange)="load($event)" name="fy" aria-label="Financial year">
      <option *ngFor="let y of h.years" [ngValue]="y">{{ y - 1 }}–{{ ('' + y).slice(2) }}</option>
    </select></label>
</div>

<div *ngIf="error" class="cy-card mt-4 flex flex-col gap-3">
  <div class="font-bold">We could not load the history</div><div class="text-sm text-[#3C4663]">{{ error }}</div>
  <button type="button" class="cy-btn-secondary self-start" (click)="load()">Try again</button>
</div>
<div *ngIf="loading && !h && !error" class="mt-4 text-sm text-[#5B6478]">Loading…</div>

<ng-container *ngIf="h">
  <p class="mb-0 mt-2 text-[13px] text-[#5B6478]">{{ h.from | auDate }} to {{ h.to | auDate }}</p>
  <dl class="m-0 mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4" [class.opacity-60]="loading">
    <div class="rounded-[16px] bg-white px-4 py-3"><dt class="text-[12px] font-bold uppercase tracking-wide text-[#5B6478]">Gross wages</dt><dd class="m-0 mt-0.5 text-[18px] font-extrabold">{{ h.totals.gross | aud }}</dd></div>
    <div class="rounded-[16px] bg-white px-4 py-3"><dt class="text-[12px] font-bold uppercase tracking-wide text-[#5B6478]">Tax withheld</dt><dd class="m-0 mt-0.5 text-[18px] font-extrabold">{{ h.totals.tax | aud }}</dd></div>
    <div class="rounded-[16px] bg-white px-4 py-3"><dt class="text-[12px] font-bold uppercase tracking-wide text-[#5B6478]">Super</dt><dd class="m-0 mt-0.5 text-[18px] font-extrabold">{{ h.totals.super | aud }}</dd></div>
    <div class="rounded-[16px] bg-cyrcle-navy px-4 py-3 text-white"><dt class="text-[12px] font-bold uppercase tracking-wide opacity-80">Net pay</dt><dd class="m-0 mt-0.5 text-[18px] font-extrabold">{{ h.totals.net | aud }}</dd></div>
  </dl>

  <div *ngIf="!h.employees.length" class="mt-4 flex flex-col gap-2 rounded-[20px] border-2 border-dashed border-[#B9B39F] p-5">
    <div class="text-base font-bold">No finalised pay yet in {{ h.label }}</div>
    <div class="text-[13px] leading-snug text-[#3C4663]">Once a pay run is finalised, each employee's payslips and year-to-date totals appear here.</div>
  </div>

  <ul class="m-0 mt-4 flex list-none flex-col gap-2.5 p-0">
    <li *ngFor="let e of h.employees" class="rounded-[20px] bg-white">
      <button type="button" class="flex w-full items-center justify-between gap-3 px-4 py-4 text-left" (click)="toggle(e.employee_id)" [attr.aria-expanded]="open === e.employee_id">
        <span class="min-w-0">
          <span class="block truncate text-[15px] font-bold">{{ e.name }}</span>
          <span class="block text-[13px] text-[#5B6478]">{{ e.payslips.length }} {{ e.payslips.length === 1 ? 'payslip' : 'payslips' }} · gross {{ e.gross | aud }} · tax {{ e.tax | aud }} · super {{ e.super | aud }}</span>
        </span>
        <span class="shrink-0 text-right"><span class="block text-[15px] font-bold">{{ e.net | aud }}</span><span class="block text-[12px] text-[#5B6478]">net</span></span>
      </button>
      <ul *ngIf="open === e.employee_id" class="m-0 list-none border-t border-cyrcle-pearl p-0">
        <li *ngFor="let s of e.payslips" class="flex items-center justify-between gap-3 border-b border-cyrcle-pearl px-4 py-3 last:border-b-0">
          <span class="min-w-0 text-sm">
            <span class="block font-bold">{{ s.period_start | auDate }} to {{ s.period_end | auDate }}</span>
            <span class="block text-[13px] text-[#5B6478]">Paid {{ s.pay_date | auDate }} · {{ s.reference }} · net {{ s.net | aud }}</span>
          </span>
          <a class="shrink-0 text-[13px] font-bold text-cyrcle-midnight underline" [routerLink]="['/admin/payroll/runs', s.run_id, 'payslip', s.line_id]">Payslip</a>
        </li>
      </ul>
    </li>
  </ul>
</ng-container>`
})
export class PayHistoryComponent implements OnInit {
  h: History | null = null;
  loading = true; error = '';
  open: number | null = null;

  constructor(private api: PayRunService) { }
  ngOnInit(): void { this.load(); }

  load(fy?: number): void {
    this.loading = true; this.error = ''; this.open = null;
    this.api.history(fy).subscribe({
      next: r => { this.h = r; this.loading = false; },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }
  toggle(id: number): void { this.open = this.open === id ? null : id; }
}

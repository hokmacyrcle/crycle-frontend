import { Component, OnInit } from '@angular/core';
import { toProblem } from '../sales/sales.service';
import { Overview } from './payrun.models';
import { PayRunService } from './payrun.service';

@Component({
  selector: 'app-payroll-home',
  template: `
<div *ngIf="error" class="cy-card flex flex-col gap-3">
  <div class="font-bold">We could not load your payroll overview</div><div class="text-sm text-[#3C4663]">{{ error }}</div>
  <button type="button" class="cy-btn-secondary self-start" (click)="load()">Try again</button>
</div>
<div *ngIf="loading && !o && !error" class="text-sm text-[#5B6478]">Loading…</div>

<ng-container *ngIf="o as ov">
  <div *ngIf="!ov.employees" class="flex flex-col gap-2 rounded-[20px] border-2 border-dashed border-[#B9B39F] p-5">
    <div class="text-base font-bold">Start by adding your employees</div>
    <div class="text-[13px] leading-snug text-[#3C4663]">Add each person with their pay rate, tax file number and super fund. Then you can run payroll and see everything here.</div>
    <a routerLink="/admin/payroll/employees/new" class="cy-btn-primary mt-1 self-start">Add employee</a>
  </div>

  <ng-container *ngIf="ov.employees">
    <dl class="m-0 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      <div class="rounded-[16px] bg-white px-4 py-3"><dt class="text-[12px] font-bold uppercase tracking-wide text-[#5B6478]">Employees</dt><dd class="m-0 mt-0.5 text-[18px] font-extrabold">{{ ov.employees }}</dd></div>
      <div class="rounded-[16px] bg-white px-4 py-3"><dt class="text-[12px] font-bold uppercase tracking-wide text-[#5B6478]">Wages {{ ov.fy_label }}</dt><dd class="m-0 mt-0.5 text-[18px] font-extrabold">{{ ov.fy_totals.gross | aud }}</dd></div>
      <div class="rounded-[16px] bg-white px-4 py-3"><dt class="text-[12px] font-bold uppercase tracking-wide text-[#5B6478]">Tax withheld</dt><dd class="m-0 mt-0.5 text-[18px] font-extrabold">{{ ov.fy_totals.tax | aud }}</dd></div>
      <div class="rounded-[16px] bg-white px-4 py-3"><dt class="text-[12px] font-bold uppercase tracking-wide text-[#5B6478]">Super</dt><dd class="m-0 mt-0.5 text-[18px] font-extrabold">{{ ov.fy_totals.super | aud }}</dd></div>
    </dl>

    <section class="mt-6" aria-labelledby="runs-h">
      <div id="runs-h" class="text-[16px] font-extrabold" role="heading" aria-level="2">Pay runs</div>
      <ul class="m-0 mt-2 flex list-none flex-col gap-2.5 p-0">
        <li *ngFor="let d of ov.drafts" class="flex items-center justify-between gap-3 rounded-[20px] bg-white px-4 py-3.5">
          <span class="min-w-0">
            <span class="block text-[15px] font-bold">{{ d.reference }} · {{ d.frequency }} <span class="cy-pill cy-pill-draft ml-1">Draft</span></span>
            <span class="block text-[13px] text-[#5B6478]">{{ d.period_start | auDate }} to {{ d.period_end | auDate }} · pay date {{ d.pay_date | auDate }}</span>
            <span class="block text-[13px]" [ngClass]="d.needs_attention ? 'font-bold text-[#7A5200]' : 'text-[#5B6478]'">{{ d.needs_attention ? d.needs_attention + (d.needs_attention === 1 ? ' line needs' : ' lines need') + ' your attention' : 'Ready to finalise' }}</span>
          </span>
          <a [routerLink]="['/admin/payroll/runs', d.id]" class="cy-btn-secondary cy-btn-sm shrink-0">Open</a>
        </li>
        <ng-container *ngFor="let n of ov.up_next">
          <li *ngIf="!n.has_draft" class="flex items-center justify-between gap-3 rounded-[20px] bg-white px-4 py-3.5">
            <span class="min-w-0">
              <span class="block text-[15px] font-bold">{{ n.frequency }} · {{ n.employees }} {{ n.employees === 1 ? 'employee' : 'employees' }}</span>
              <span *ngIf="n.next_start" class="block text-[13px] text-[#5B6478]">Next period {{ n.next_start | auDate }} to {{ n.next_end | auDate }}</span>
              <span *ngIf="!n.next_start" class="block text-[13px] text-[#5B6478]">No {{ n.frequency | lowercase }} pay run yet</span>
              <span *ngIf="n.ready" class="block text-[13px] font-bold text-[#7A5200]">This period has ended. It is ready to pay.</span>
            </span>
            <a routerLink="/admin/payroll/runs/new" [queryParams]="n.next_start ? { frequency: n.frequency, start: n.next_start, end: n.next_end } : { frequency: n.frequency }" class="shrink-0" [ngClass]="n.ready ? 'cy-btn-primary cy-btn-sm' : 'cy-btn-secondary cy-btn-sm'">{{ n.next_start ? 'Start pay run' : 'Start first run' }}</a>
          </li>
        </ng-container>
      </ul>
      <div *ngIf="!ov.drafts.length && !ov.up_next.length" class="mt-2 rounded-[16px] bg-white px-4 py-3 text-sm text-[#3C4663]">Choose a pay frequency for your employees to start pay runs.</div>
    </section>

    <section class="mt-6" aria-labelledby="super-h">
      <div id="super-h" class="text-[16px] font-extrabold" role="heading" aria-level="2">Super to pay</div>
      <div *ngIf="!ov.super_owing.length" class="mt-2 rounded-[16px] bg-white px-4 py-3 text-sm text-[#3C4663]">No super waiting. Finalised pay runs show up here until you mark their super as paid.</div>
      <ul *ngIf="ov.super_owing.length" class="m-0 mt-2 flex list-none flex-col gap-2.5 p-0">
        <li *ngFor="let s of ov.super_owing" class="flex items-center justify-between gap-3 rounded-[20px] bg-white px-4 py-3.5">
          <span class="min-w-0">
            <span class="block text-[15px] font-bold">{{ s.amount | aud }} <span class="font-normal text-[#5B6478]">· {{ s.reference }}</span></span>
            <span class="block text-[13px]" [ngClass]="s.overdue ? 'font-bold text-[#9B1C1C]' : 'text-[#5B6478]'">{{ s.overdue ? 'Overdue. Was due' : 'Due by' }} {{ s.due_date | auDate }}</span>
          </span>
          <a [routerLink]="['/admin/payroll/runs', s.run_id]" class="cy-btn-secondary cy-btn-sm shrink-0">Open</a>
        </li>
      </ul>
    </section>

    <section class="mt-6" aria-labelledby="att-h">
      <div id="att-h" class="text-[16px] font-extrabold" role="heading" aria-level="2">Employee details</div>
      <div *ngIf="!ov.attention.length" class="mt-2 flex items-center gap-2 rounded-[16px] bg-[#D5ECE3] px-4 py-3 text-sm text-cyrcle-midnight"><app-icon name="check" [size]="18"></app-icon>Everyone has pay, tax, bank and super details.</div>
      <ul *ngIf="ov.attention.length" class="m-0 mt-2 flex list-none flex-col gap-2.5 p-0">
        <li *ngFor="let a of ov.attention" class="flex items-center justify-between gap-3 rounded-[20px] bg-white px-4 py-3.5">
          <span class="min-w-0">
            <span class="block truncate text-[15px] font-bold">{{ a.name }}</span>
            <span class="mt-1 flex flex-wrap gap-1.5"><span *ngFor="let i of a.issues" class="cy-pill cy-pill-expired">{{ i }}</span></span>
          </span>
          <a [routerLink]="['/admin/payroll/employees', a.employee_id, 'edit']" class="cy-btn-secondary cy-btn-sm shrink-0">Fix</a>
        </li>
      </ul>
    </section>
  </ng-container>
</ng-container>`
})
export class PayrollHomeComponent implements OnInit {
  o: Overview | null = null;
  loading = true; error = '';
  constructor(private api: PayRunService) { }
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true; this.error = '';
    this.api.overview().subscribe({
      next: r => { this.o = r; this.loading = false; },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }
}

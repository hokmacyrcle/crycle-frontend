import { Component, OnInit } from '@angular/core';
import { Meta } from '../payroll-employees/employees.models';
import { toProblem } from '../sales/sales.service';
import { PayRunRow } from './payrun.models';
import { PayRunService } from './payrun.service';

@Component({
  selector: 'app-pay-run-list',
  template: `
<div class="flex items-center justify-between gap-3">
  <p class="m-0 text-sm text-[#3C4663]">Each pay run works out wages, tax and super for one pay period.</p>
  <a routerLink="/admin/payroll/runs/new" class="cy-btn-primary shrink-0"><app-icon name="plus" [size]="18"></app-icon>New pay run</a>
</div>

<div *ngIf="error" class="cy-card mt-4 flex flex-col gap-3">
  <div class="font-bold">We could not load your pay runs</div>
  <div class="text-sm text-[#3C4663]">{{ error }}</div>
  <button type="button" class="cy-btn-secondary self-start" (click)="load(1)">Try again</button>
</div>

<div *ngIf="loading && !rows.length && !error" class="mt-5 text-sm text-[#5B6478]">Loading…</div>

<div *ngIf="!loading && !error && !rows.length" class="mt-5 flex flex-col gap-2 rounded-[20px] border-2 border-dashed border-[#B9B39F] p-5">
  <div class="text-base font-bold">Start your first pay run</div>
  <div class="text-[13px] leading-snug text-[#3C4663]">Pick how often people are paid and the dates. Cyrcle adds everyone paid on that schedule and works out their tax and super. You check it, then finalise.</div>
  <a routerLink="/admin/payroll/runs/new" class="cy-btn-primary mt-1 self-start">New pay run</a>
</div>

<ul *ngIf="rows.length" class="m-0 mt-4 flex list-none flex-col gap-2.5 p-0" [class.opacity-60]="loading">
  <li *ngFor="let r of rows">
    <a [routerLink]="['/admin/payroll/runs', r.id]" class="block rounded-[20px] bg-white px-4 py-4 text-cyrcle-navy no-underline hover:shadow-sm">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="text-[15px] font-bold">{{ r.reference }} · {{ r.frequency }}</div>
          <div class="text-[13px] text-[#5B6478]">{{ r.period_start | auDate }} to {{ r.period_end | auDate }}</div>
          <div class="text-[13px] text-[#5B6478]">Paid {{ r.pay_date | auDate }} · {{ r.employees }} {{ r.employees === 1 ? 'employee' : 'employees' }}</div>
        </div>
        <div class="shrink-0 text-right">
          <span class="cy-pill" [ngClass]="r.status === 'finalised' ? 'cy-pill-paid' : 'cy-pill-draft'">{{ r.status === 'finalised' ? 'Finalised' : 'Draft' }}</span>
          <div class="mt-1.5 text-[15px] font-bold">{{ r.total_net | aud }}</div>
          <div class="text-[12px] text-[#5B6478]">net pay</div>
        </div>
      </div>
    </a>
  </li>
</ul>

<div *ngIf="meta.total > meta.per_page" class="mt-4 flex items-center justify-between gap-3 text-sm">
  <span class="text-[#5B6478]">{{ meta.total }} pay runs</span>
  <div class="flex gap-2">
    <button type="button" class="cy-btn-secondary cy-btn-sm" [disabled]="meta.page <= 1 || loading" (click)="load(meta.page - 1)"><app-icon name="chevron-left" [size]="16"></app-icon>Previous</button>
    <button type="button" class="cy-btn-secondary cy-btn-sm" [disabled]="meta.page >= meta.last_page || loading" (click)="load(meta.page + 1)">Next<app-icon name="chevron-right" [size]="16"></app-icon></button>
  </div>
</div>`
})
export class PayRunListComponent implements OnInit {
  rows: PayRunRow[] = [];
  meta: Meta = { page: 1, per_page: 15, total: 0, last_page: 1 };
  loading = true;
  error = '';

  constructor(private api: PayRunService) { }
  ngOnInit(): void { this.load(1); }

  load(page: number): void {
    this.loading = true; this.error = '';
    this.api.list(page).subscribe({
      next: r => { this.rows = r.data; this.meta = r.meta; this.loading = false; },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }
}

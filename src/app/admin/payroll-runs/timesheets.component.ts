import { Component, OnInit } from '@angular/core';
import { toProblem } from '../sales/sales.service';
import { TimesheetEmployee, TimesheetWeekData } from './payrun.models';
import { PayRunService } from './payrun.service';

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = (s: string) => new Date(s + 'T00:00:00');

/** Hours worked each day by hourly employees. Approved weeks flow into pay runs. */
@Component({
  selector: 'app-timesheets',
  template: `
<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <p class="m-0 text-sm text-[#3C4663]">Enter the hours your hourly staff worked, then approve the week. Approved hours go straight into pay runs.</p>
  <div class="flex shrink-0 items-center gap-2" role="group" aria-label="Choose week">
    <button type="button" class="cy-btn-secondary cy-btn-sm" (click)="move(-7)" aria-label="Previous week"><app-icon name="chevron-left" [size]="16"></app-icon></button>
    <span class="min-w-[170px] text-center text-sm font-bold" *ngIf="d">{{ d.week_start | auDate }} – {{ d.week_end | auDate }}</span>
    <button type="button" class="cy-btn-secondary cy-btn-sm" (click)="move(7)" aria-label="Next week"><app-icon name="chevron-right" [size]="16"></app-icon></button>
    <button type="button" class="cy-btn-secondary cy-btn-sm" (click)="load(undefined)">This week</button>
  </div>
</div>

<div *ngIf="error" class="cy-card mt-4 flex flex-col gap-3">
  <div class="font-bold">We could not load the timesheets</div><div class="text-sm text-[#3C4663]">{{ error }}</div>
  <button type="button" class="cy-btn-secondary self-start" (click)="load(d?.week_start)">Try again</button>
</div>
<div *ngIf="loading && !d && !error" class="mt-4 text-sm text-[#5B6478]">Loading…</div>

<ng-container *ngIf="d">
  <div *ngIf="!d.employees.length" class="mt-4 flex flex-col gap-2 rounded-[20px] border-2 border-dashed border-[#B9B39F] p-5">
    <div class="text-base font-bold">No hourly employees yet</div>
    <div class="text-[13px] leading-snug text-[#3C4663]">Timesheets are for people paid by the hour. Add an employee with an hourly rate and they will appear here.</div>
    <a routerLink="/admin/payroll/employees/new" class="cy-btn-primary mt-1 self-start">Add employee</a>
  </div>

  <ul class="m-0 mt-4 flex list-none flex-col gap-3 p-0" [class.opacity-60]="loading">
    <li *ngFor="let e of d.employees" class="rounded-[20px] bg-white p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="truncate text-[15px] font-bold">{{ e.name }}</div>
          <div class="text-[13px] text-[#5B6478]" *ngIf="e.hourly_rate !== null">{{ e.hourly_rate | aud }} an hour</div>
        </div>
        <span class="cy-pill shrink-0" [ngClass]="e.locked_in ? 'cy-pill-invoiced' : e.status === 'approved' ? 'cy-pill-paid' : 'cy-pill-draft'">{{ e.locked_in ? 'Paid in ' + e.locked_in : e.status === 'approved' ? 'Approved' : 'Draft' }}</span>
      </div>

      <div class="mt-3 grid grid-cols-7 gap-1.5 sm:gap-2">
        <label *ngFor="let day of d.days" class="block min-w-0">
          <span class="mb-1 block whitespace-nowrap text-center text-[10px] font-bold uppercase text-[#5B6478] sm:text-[12px]">{{ label(day) }}</span>
          <input type="text" inputmode="decimal" class="cy-input !px-1 text-center sm:!px-2" [attr.aria-label]="e.name + ' ' + label(day)"
                 [ngModel]="cell(e, day)" (ngModelChange)="set(e, day, $event)" [name]="'h' + e.employee_id + day"
                 [disabled]="locked(e)" [class.cy-input-error]="errors[e.employee_id + day]" placeholder="–">
        </label>
      </div>
      <div *ngFor="let day of d.days">
        <div *ngIf="errors[e.employee_id + day]" class="mt-1 text-[13px] font-bold text-[#9B1C1C]" role="alert">{{ label(day) }}: {{ errors[e.employee_id + day] }}</div>
      </div>
      <div *ngIf="rowError[e.employee_id]" class="mt-2 text-[13px] font-bold text-[#9B1C1C]" role="alert">{{ rowError[e.employee_id] }}</div>

      <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div class="text-sm">Total <b>{{ total(e) }}</b> hours <span *ngIf="e.hourly_rate !== null" class="text-[#5B6478]">· {{ total(e) * e.hourly_rate | aud }}</span></div>
        <div class="flex gap-2" *ngIf="!e.locked_in">
          <button *ngIf="e.status !== 'approved'" type="button" class="cy-btn-secondary cy-btn-sm" (click)="save(e)" [disabled]="busy === e.employee_id">Save</button>
          <button *ngIf="e.status !== 'approved'" type="button" class="cy-btn-primary cy-btn-sm" (click)="approve(e, true)" [disabled]="busy === e.employee_id"><app-icon name="check" [size]="16"></app-icon>Save and approve</button>
          <button *ngIf="e.status === 'approved'" type="button" class="cy-btn-secondary cy-btn-sm" (click)="approve(e, false)" [disabled]="busy === e.employee_id">Reopen</button>
        </div>
      </div>
    </li>
  </ul>
  <p class="mt-4 text-[12px] leading-snug text-[#5B6478]">Weeks run Monday to Sunday. Hours already paid in a finalised pay run are locked. Hours count in the pay run for the days that fall inside its pay period.</p>
</ng-container>`
})
export class TimesheetsComponent implements OnInit {
  d: TimesheetWeekData | null = null;
  loading = true; error = '';
  busy: number | null = null;
  edit: Record<number, Record<string, string>> = {};
  errors: Record<string, string> = {};
  rowError: Record<number, string> = {};

  constructor(private api: PayRunService) { }
  ngOnInit(): void { this.load(undefined); }

  load(week: string | undefined): void {
    this.loading = true; this.error = '';
    this.api.timesheets(week).subscribe({
      next: r => { this.apply(r); this.loading = false; },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }

  private apply(r: TimesheetWeekData): void {
    this.d = r; this.edit = {}; this.errors = {}; this.rowError = {};
    r.employees.forEach(e => { this.edit[e.employee_id] = {}; r.days.forEach(day => { const h = e.hours[day]; this.edit[e.employee_id][day] = h === null || h === undefined ? '' : String(h); }); });
  }

  move(days: number): void { if (this.d) { const x = parse(this.d.week_start); x.setDate(x.getDate() + days); this.load(iso(x)); } }

  label(day: string): string { const x = parse(day); return x.toLocaleDateString('en-AU', { weekday: 'short' }) + ' ' + x.getDate(); }
  locked(e: TimesheetEmployee): boolean { return !!e.locked_in || e.status === 'approved'; }
  cell(e: TimesheetEmployee, day: string): string { return this.edit[e.employee_id]?.[day] ?? ''; }
  set(e: TimesheetEmployee, day: string, v: string): void { (this.edit[e.employee_id] ||= {})[day] = v; delete this.errors[e.employee_id + day]; }

  total(e: TimesheetEmployee): number {
    return Math.round(Object.values(this.edit[e.employee_id] || {}).reduce((a, v) => { const n = Number(v); return a + (v.trim() === '' || isNaN(n) ? 0 : n); }, 0) * 100) / 100;
  }

  /** Reads the boxes into numbers, or records which box is wrong. */
  private read(e: TimesheetEmployee): Record<string, number | null> | null {
    const out: Record<string, number | null> = {}; let ok = true;
    this.d?.days.forEach(day => {
      const v = (this.edit[e.employee_id]?.[day] ?? '').trim();
      if (v === '') { out[day] = null; return; }
      const n = Number(v);
      if (isNaN(n) || n < 0 || n > 24) { this.errors[e.employee_id + day] = 'Enter hours between 0 and 24, for example 7.5.'; ok = false; }
      else if (Math.abs(n * 100 - Math.round(n * 100)) > 1e-6) { this.errors[e.employee_id + day] = 'Use at most 2 decimal places.'; ok = false; }
      else out[day] = n;
    });
    return ok ? out : null;
  }

  private fail(e: TimesheetEmployee, err: unknown): void {
    this.busy = null; const p = toProblem(err);
    Object.keys(p.fieldErrors).forEach(k => { const day = k.replace('hours.', ''); this.errors[e.employee_id + day] = p.fieldErrors[k]; });
    this.rowError[e.employee_id] = Object.keys(p.fieldErrors).length ? '' : p.message;
  }

  save(e: TimesheetEmployee, then?: () => void): void {
    if (!this.d) return;
    this.errors = {}; this.rowError[e.employee_id] = '';
    const hours = this.read(e); if (!hours) return;
    this.busy = e.employee_id;
    this.api.saveTimesheet(e.employee_id, this.d.week_start, hours).subscribe({
      next: r => { if (then) { this.d = r; then(); } else { this.busy = null; this.apply(r); } },
      error: err => this.fail(e, err)
    });
  }

  approve(e: TimesheetEmployee, approved: boolean): void {
    if (!this.d) return;
    const week = this.d.week_start;
    const go = () => this.api.approveTimesheet(e.employee_id, week, approved).subscribe({
      next: r => { this.busy = null; this.apply(r); }, error: err => this.fail(e, err) });
    if (approved) this.save(e, go); else { this.busy = e.employee_id; go(); }
  }
}

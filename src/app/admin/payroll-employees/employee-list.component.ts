import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';
import { toProblem } from '../sales/sales.service';
import { EmployeeRow, Meta } from './employees.models';
import { PayrollEmployeesService } from './employees.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html'
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  rows: EmployeeRow[] = [];
  meta: Meta = { page: 1, per_page: 15, total: 0, last_page: 1 };
  counts = { active: 0, archived: 0 };
  archived = false;
  search = '';
  loading = true;
  error = '';
  busyId: number | null = null;

  /** The ATO's reasons for employment ending, reported through Single Touch Payroll. */
  reasons = [
    { code: 'V', label: 'Resigned or left by choice' }, { code: 'R', label: 'Redundancy' }, { code: 'C', label: 'Contract ended' },
    { code: 'F', label: 'Dismissed' }, { code: 'I', label: 'Ill health' }, { code: 'D', label: 'Deceased' }, { code: 'T', label: 'Transferred to another employer' },
  ];
  leaving: EmployeeRow | null = null;
  leaveForm = { last_day: '', reason: '' };
  leaveErrors: Record<string, string> = {};

  private search$ = new Subject<string>();
  private sub = new Subscription();

  constructor(private api: PayrollEmployeesService, private alerts: AlertService, private router: Router) { }

  ngOnInit(): void {
    this.load(1);
    this.sub.add(this.search$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => this.load(1)));
  }
  ngOnDestroy(): void { this.sub.unsubscribe(); }

  onSearch(v: string): void { this.search = v; this.search$.next(v.trim()); }
  setArchived(a: boolean): void { if (this.archived !== a) { this.archived = a; this.load(1); } }

  load(page: number): void {
    this.loading = true; this.error = '';
    this.api.list({ status: this.archived ? 'archived' : 'active', search: this.search.trim(), page }).subscribe({
      next: r => { this.rows = r.data; this.meta = r.meta; this.counts = r.counts; this.loading = false; },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }

  edit(e: EmployeeRow): void { this.router.navigate(['/admin/payroll/employees', e.id, 'edit']); }

  /** Restoring happens straight away. Archiving first asks for the last day and the reason. */
  toggle(e: EmployeeRow): void {
    if (this.archived) { this.send(e, true); return; }
    this.leaving = e; this.leaveForm = { last_day: new Date().toISOString().slice(0, 10), reason: '' }; this.leaveErrors = {};
  }
  cancelLeaving(): void { this.leaving = null; this.leaveErrors = {}; }

  confirmLeaving(): void {
    if (!this.leaving) return;
    const err: Record<string, string> = {};
    if (!this.leaveForm.last_day) err['last_day'] = 'Enter the last day they worked.';
    if (!this.leaveForm.reason) err['reason'] = 'Choose why employment ended.';
    this.leaveErrors = err;
    if (Object.keys(err).length) return;
    this.send(this.leaving, false);
  }

  private send(e: EmployeeRow, restore: boolean): void {
    this.busyId = e.id;
    this.api.archive(e.id, !restore, restore ? undefined : { last_day: this.leaveForm.last_day, reason: this.leaveForm.reason }).subscribe({
      next: () => {
        this.busyId = null; this.leaving = null;
        this.alerts.toast(restore ? 'Employee restored' : 'Employee archived');
        this.load(this.rows.length === 1 && this.meta.page > 1 ? this.meta.page - 1 : this.meta.page);
      },
      error: err => {
        this.busyId = null; const p = toProblem(err);
        if (this.leaving && Object.keys(p.fieldErrors).length) this.leaveErrors = p.fieldErrors; else this.alerts.DangerSwalnew('That did not work', p.message);
      }
    });
  }

  get from(): number { return this.meta.total ? (this.meta.page - 1) * this.meta.per_page + 1 : 0; }
  get to(): number { return Math.min(this.meta.page * this.meta.per_page, this.meta.total); }
}

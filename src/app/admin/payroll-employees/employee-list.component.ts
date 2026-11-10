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

  async toggle(e: EmployeeRow): Promise<void> {
    if (!this.archived && !(await this.alerts.confirm('Archive ' + e.name + '?', 'They will no longer be included in pay runs. Their details and pay history are kept, and you can restore them any time.', 'Archive'))) return;
    this.busyId = e.id;
    this.api.archive(e.id, !this.archived).subscribe({
      next: () => { this.busyId = null; this.alerts.toast(this.archived ? 'Employee restored' : 'Employee archived'); this.load(this.rows.length === 1 && this.meta.page > 1 ? this.meta.page - 1 : this.meta.page); },
      error: err => { this.busyId = null; this.alerts.DangerSwalnew('That did not work', toProblem(err).message); }
    });
  }

  get from(): number { return this.meta.total ? (this.meta.page - 1) * this.meta.per_page + 1 : 0; }
  get to(): number { return Math.min(this.meta.page * this.meta.per_page, this.meta.total); }
}

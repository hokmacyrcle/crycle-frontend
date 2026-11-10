import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';
import { CustomerRow, Meta } from './sales.models';
import { SalesService, toProblem } from './sales.service';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html'
})
export class CustomerListComponent implements OnInit, OnDestroy {
  rows: CustomerRow[] = [];
  meta: Meta = { page: 1, per_page: 15, total: 0, last_page: 1 };
  archived = false;
  search = '';
  loading = true;
  error = '';
  busyId: number | null = null;

  private search$ = new Subject<string>();
  private sub = new Subscription();

  constructor(private api: SalesService, private alerts: AlertService, private router: Router) { }

  ngOnInit(): void {
    this.load(1);
    this.sub.add(this.search$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => this.load(1)));
  }
  ngOnDestroy(): void { this.sub.unsubscribe(); }

  onSearch(v: string): void { this.search = v; this.search$.next(v.trim()); }
  toggleArchived(): void { this.archived = !this.archived; this.load(1); }

  load(page: number): void {
    this.loading = true; this.error = '';
    this.api.customers({ status: this.archived ? 'archived' : 'active', search: this.search.trim(), page }).subscribe({
      next: r => { this.rows = r.data; this.meta = r.meta; this.loading = false; },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }

  edit(c: CustomerRow): void { this.router.navigate(['/admin/sales/customers', c.id, 'edit']); }
  invoice(c: CustomerRow): void { this.router.navigate(['/admin/sales/invoices/new'], { queryParams: { customer: c.id } }); }

  async toggle(c: CustomerRow): Promise<void> {
    if (!this.archived && !(await this.alerts.confirm('Archive ' + c.name + '?', 'They will no longer appear when you create invoices. Their past invoices stay as they are. You can restore them any time.', 'Archive'))) return;
    this.busyId = c.id;
    this.api.archiveCustomer(c.id, !this.archived).subscribe({
      next: r => { this.busyId = null; this.alerts.toast(r.message); this.load(this.rows.length === 1 && this.meta.page > 1 ? this.meta.page - 1 : this.meta.page); },
      error: e => { this.busyId = null; this.alerts.DangerSwalnew('That did not work', toProblem(e).message); }
    });
  }

  get from(): number { return this.meta.total ? (this.meta.page - 1) * this.meta.per_page + 1 : 0; }
  get to(): number { return Math.min(this.meta.page * this.meta.per_page, this.meta.total); }
}

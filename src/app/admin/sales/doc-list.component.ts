import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { DocKind, DocRow, Meta } from './sales.models';
import { SalesService, toProblem } from './sales.service';
import { INVOICE_FILTERS, QUOTE_FILTERS, STATUS_LABEL } from './sales.labels';

/** The Invoices and Quotes lists (same screen, chosen by the route). */
@Component({
  selector: 'app-doc-list',
  templateUrl: './doc-list.component.html'
})
export class DocListComponent implements OnInit, OnDestroy {
  kind: DocKind = 'invoice';
  rows: DocRow[] = [];
  counts: Record<string, number> = {};
  meta: Meta = { page: 1, per_page: 15, total: 0, last_page: 1 };
  status = 'all';
  search = '';
  loading = true;
  error = '';
  label = STATUS_LABEL;

  private search$ = new Subject<string>();
  private subs = new Subscription();

  constructor(private api: SalesService, private route: ActivatedRoute, private router: Router) { }

  get filters() { return this.kind === 'invoice' ? INVOICE_FILTERS : QUOTE_FILTERS; }
  get noun(): string { return this.kind === 'invoice' ? 'invoice' : 'quote'; }
  get hasFilter(): boolean { return this.status !== 'all' || !!this.search.trim(); }

  ngOnInit(): void {
    this.subs.add(this.route.data.subscribe(d => {
      this.kind = d['kind'];
      this.rows = []; this.search = ''; this.status = this.route.snapshot.queryParamMap.get('status') || 'all';
      this.load(1);
    }));
    this.subs.add(this.route.queryParamMap.subscribe(q => {
      const s = q.get('status') || 'all';
      if (s !== this.status) { this.status = s; this.load(1); }
    }));
    this.subs.add(this.search$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => this.load(1)));
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  onSearch(v: string): void { this.search = v; this.search$.next(v.trim()); }

  setStatus(key: string): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { status: key === 'all' ? null : key }, queryParamsHandling: 'merge' });
  }

  load(page: number): void {
    this.loading = true; this.error = '';
    this.api.list(this.kind, { status: this.status, search: this.search.trim(), page }).subscribe({
      next: r => { this.rows = r.data; this.counts = r.counts; this.meta = r.meta; this.loading = false; },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }

  /** An invoice that is still owing shows what is left to pay; everything else shows its total. */
  showsBalance(r: DocRow): boolean {
    return this.kind === 'invoice' && !['paid', 'void', 'draft'].includes(r.status) && r.amount_due !== undefined && r.amount_due !== r.total;
  }

  shownAmount(r: DocRow): number {
    return this.kind === 'invoice' && !['paid', 'void', 'draft'].includes(r.status) && r.amount_due !== undefined ? r.amount_due : r.total;
  }

  go(id: number): void { this.router.navigate(['/admin/sales', this.kind === 'invoice' ? 'invoices' : 'quotes', id]); }

  get from(): number { return this.meta.total ? (this.meta.page - 1) * this.meta.per_page + 1 : 0; }
  get to(): number { return Math.min(this.meta.page * this.meta.per_page, this.meta.total); }
}

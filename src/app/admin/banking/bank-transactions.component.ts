import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { toProblem } from '../sales/sales.service';
import { BankAccount, BankTxn, TxnFilter, TxnPage, TxnStatus } from './banking.models';
import { BankingService } from './banking.service';
import { saveBlob } from './sample-csv';

/** Bank transactions: an account strip on top, then a table in three tabs (For review, Done, Excluded). */
@Component({
  selector: 'app-bank-transactions',
  templateUrl: './bank-transactions.component.html'
})
export class BankTransactionsComponent implements OnInit {
  tabs: { key: TxnStatus; label: string }[] = [
    { key: 'review', label: 'For review' }, { key: 'done', label: 'Done' }, { key: 'excluded', label: 'Excluded' }
  ];
  accounts: BankAccount[] = [];
  accountId: number | null = null;
  status: TxnStatus = 'review';
  f: TxnFilter = { search: '', from: '', to: '', type: '' };
  page = 1;
  data: TxnPage | null = null;
  loading = true;
  error = '';
  busyId: number | null = null;
  syncing = false;
  exporting = false;
  selected = new Set<number>();

  constructor(private route: ActivatedRoute, private router: Router, private api: BankingService, private alerts: AlertService) { }

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    this.accountId = q.get('account') ? Number(q.get('account')) : null;
    const st = q.get('status');
    if (st === 'review' || st === 'done' || st === 'excluded') this.status = st;
    this.loadAccounts();
    this.load();
  }

  loadAccounts(): void { this.api.accounts().subscribe({ next: a => this.accounts = a, error: () => { } }); }

  get account(): BankAccount | null { return this.accounts.find(a => a.id === this.accountId) || null; }
  count(k: TxnStatus): number { return this.data ? this.data.counts[k] : 0; }
  get from(): number { return this.data && this.data.meta.total ? (this.data.meta.page - 1) * this.data.meta.per_page + 1 : 0; }
  get to(): number { return this.data ? Math.min(this.data.meta.page * this.data.meta.per_page, this.data.meta.total) : 0; }
  get hasFilter(): boolean { return !!(this.f.search || this.f.from || this.f.to || this.f.type); }

  get allSelected(): boolean { return !!this.data && this.data.data.length > 0 && this.data.data.every(t => this.selected.has(t.id)); }
  toggleAll(on: boolean): void { this.data?.data.forEach(t => on ? this.selected.add(t.id) : this.selected.delete(t.id)); }
  toggle(t: BankTxn, on: boolean): void { on ? this.selected.add(t.id) : this.selected.delete(t.id); }

  /** "Updated 3 hours ago" style text for the account tile. */
  updated(a: BankAccount): string {
    const when = a.last_synced_at || a.last_imported_at;
    if (!when) return a.feed_connected ? 'Not updated yet' : 'Nothing imported';
    const mins = Math.max(0, Math.round((Date.now() - new Date(when).getTime()) / 60000));
    if (mins < 2) return 'Updated just now';
    if (mins < 60) return `Updated ${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 36) return `Updated ${hrs} h ago`;
    return `Updated ${Math.round(hrs / 24)} d ago`;
  }

  load(): void {
    this.loading = true; this.error = '';
    this.api.transactions(this.accountId, this.status, { ...this.f, search: this.f.search.trim() }, this.page).subscribe({
      next: d => { this.data = d; this.loading = false; this.selected.clear(); },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }

  setTab(k: TxnStatus): void { this.status = k; this.page = 1; this.load(); }
  setAccount(id: number | null): void {
    this.accountId = id; this.page = 1;
    this.router.navigate([], { relativeTo: this.route, queryParams: { account: id }, queryParamsHandling: 'merge', replaceUrl: true });
    this.load();
  }
  find(): void { this.page = 1; this.load(); }
  clearFilters(): void { this.f = { search: '', from: '', to: '', type: '' }; this.find(); }
  go(p: number): void { this.page = p; this.load(); }

  /** Downloads exactly what the table shows now (account, tab and filters), not just this page. */
  export(): void {
    this.exporting = true;
    this.api.exportTransactions(this.accountId, this.status, { ...this.f, search: this.f.search.trim() }).subscribe({
      next: blob => { this.exporting = false; saveBlob(blob, 'cyrcle-bank-transactions.csv'); },
      error: () => { this.exporting = false; this.alerts.DangerSwalnew('That did not work', 'We could not prepare the file. Please try again.'); }
    });
  }

  update(): void {
    if (!this.accountId) return;
    this.syncing = true;
    this.api.syncAccount(this.accountId).subscribe({
      next: r => { this.syncing = false; this.alerts.toast(r.message); this.loadAccounts(); this.load(); },
      error: e => { this.syncing = false; this.alerts.DangerSwalnew('That did not work', toProblem(e).message); }
    });
  }

  change(t: BankTxn, to: 'excluded' | 'review'): void {
    this.busyId = t.id;
    this.api.setStatus(t.id, to).subscribe({
      next: r => { this.busyId = null; this.alerts.toast(r.message); this.loadAccounts(); this.load(); },
      error: e => { this.busyId = null; this.alerts.DangerSwalnew('That did not work', toProblem(e).message); }
    });
  }

  bulk(to: 'excluded' | 'review'): void {
    const ids = Array.from(this.selected);
    if (!ids.length) return;
    this.loading = true;
    this.api.bulkStatus(ids, to).subscribe({
      next: r => { this.alerts.toast(r.message); this.loadAccounts(); this.load(); },
      error: e => { this.loading = false; this.alerts.DangerSwalnew('That did not work', toProblem(e).message); }
    });
  }
}

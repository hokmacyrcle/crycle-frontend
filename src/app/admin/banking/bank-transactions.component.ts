import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { toProblem } from '../sales/sales.service';
import { BankAccount, BankTxn, TxnPage, TxnStatus } from './banking.models';
import { BankingService } from './banking.service';

/** Bank transactions of all accounts (or one), in three tabs: For review, Done and Excluded. */
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
  search = '';
  page = 1;
  data: TxnPage | null = null;
  loading = true;
  error = '';
  busyId: number | null = null;
  syncing = false;

  constructor(private route: ActivatedRoute, private router: Router, private api: BankingService, private alerts: AlertService) { }

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    this.accountId = q.get('account') ? Number(q.get('account')) : null;
    const st = q.get('status');
    if (st === 'review' || st === 'done' || st === 'excluded') this.status = st;
    this.api.accounts().subscribe({ next: a => this.accounts = a, error: () => { } });
    this.load();
  }

  get account(): BankAccount | null { return this.accounts.find(a => a.id === this.accountId) || null; }
  count(k: TxnStatus): number { return this.data ? this.data.counts[k] : 0; }
  get from(): number { return this.data ? (this.data.meta.page - 1) * this.data.meta.per_page + 1 : 0; }
  get to(): number { return this.data ? Math.min(this.data.meta.page * this.data.meta.per_page, this.data.meta.total) : 0; }

  load(): void {
    this.loading = true; this.error = '';
    this.api.transactions(this.accountId, this.status, this.search.trim(), this.page).subscribe({
      next: d => { this.data = d; this.loading = false; },
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
  go(p: number): void { this.page = p; this.load(); }

  update(): void {
    if (!this.accountId) return;
    this.syncing = true;
    this.api.syncAccount(this.accountId).subscribe({
      next: r => { this.syncing = false; this.alerts.toast(r.message); this.load(); },
      error: e => { this.syncing = false; this.alerts.DangerSwalnew('That did not work', toProblem(e).message); }
    });
  }

  change(t: BankTxn, to: 'excluded' | 'review'): void {
    this.busyId = t.id;
    this.api.setStatus(t.id, to).subscribe({
      next: r => { this.busyId = null; this.alerts.toast(r.message); this.load(); },
      error: e => { this.busyId = null; this.alerts.DangerSwalnew('That did not work', toProblem(e).message); }
    });
  }
}

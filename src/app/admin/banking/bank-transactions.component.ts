import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { toProblem } from '../sales/sales.service';
import { BankAccount, BankTxn, TxnPage, TxnStatus } from './banking.models';
import { BankingService } from './banking.service';

/** Transactions of one bank account, in three tabs. */
@Component({
  selector: 'app-bank-transactions',
  templateUrl: './bank-transactions.component.html'
})
export class BankTransactionsComponent implements OnInit {
  tabs: { key: TxnStatus; label: string }[] = [
    { key: 'review', label: 'For review' }, { key: 'done', label: 'Done' }, { key: 'excluded', label: 'Excluded' }
  ];
  accountId = 0;
  account: BankAccount | null = null;
  status: TxnStatus = 'review';
  search = '';
  page = 1;
  data: TxnPage | null = null;
  loading = true;
  error = '';
  busyId: number | null = null;

  constructor(private route: ActivatedRoute, private api: BankingService, private alerts: AlertService) { }

  ngOnInit(): void {
    this.accountId = Number(this.route.snapshot.paramMap.get('id'));
    this.api.accounts().subscribe({ next: a => this.account = a.find(x => x.id === this.accountId) || null, error: () => { } });
    this.load();
  }

  count(k: TxnStatus): number { return this.data ? this.data.counts[k] : 0; }

  load(): void {
    this.loading = true; this.error = '';
    this.api.transactions(this.accountId, this.status, this.search.trim(), this.page).subscribe({
      next: d => { this.data = d; this.loading = false; },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }

  setTab(k: TxnStatus): void { this.status = k; this.page = 1; this.load(); }
  find(): void { this.page = 1; this.load(); }
  go(p: number): void { this.page = p; this.load(); }

  change(t: BankTxn, to: 'excluded' | 'review'): void {
    this.busyId = t.id;
    this.api.setStatus(t.id, to).subscribe({
      next: r => { this.busyId = null; this.alerts.toast(r.message); this.load(); },
      error: e => { this.busyId = null; this.alerts.DangerSwalnew('That did not work', toProblem(e).message); }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { toProblem } from '../sales/sales.service';
import { BankAccount, ReconLine, ReconStart } from './banking.models';
import { BankingService } from './banking.service';

/**
 * Reconcile: pick the account and the statement, tick the transactions that are on the statement,
 * and finish when the difference is zero. Money is added up in whole cents.
 */
@Component({
  selector: 'app-bank-reconcile',
  templateUrl: './bank-reconcile.component.html'
})
export class BankReconcileComponent implements OnInit {
  step: 'setup' | 'working' | 'done' = 'setup';
  accounts: BankAccount[] = [];
  loadingAccounts = true;
  accountId = '';
  info: ReconStart | null = null;
  loadingInfo = false;

  f = { end: '', closing: '', opening: '' };
  fieldErrors: Record<string, string> = {};
  formError = '';
  starting = false;

  lines: ReconLine[] = [];
  truncated = false;
  ticked = new Set<number>();
  finishing = false;
  doneMessage = '';
  busyId: number | null = null;

  constructor(private route: ActivatedRoute, private api: BankingService, private alerts: AlertService) { }

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap.get('account');
    this.api.accounts().subscribe({
      next: a => {
        this.accounts = a; this.loadingAccounts = false;
        if (q && a.some(x => String(x.id) === q)) this.accountId = q;
        else if (a.length === 1) this.accountId = String(a[0].id);
        if (this.accountId) this.onAccount();
      },
      error: e => { this.loadingAccounts = false; this.formError = toProblem(e).message; }
    });
  }

  err(k: string): string { return this.fieldErrors[k] || ''; }
  get isCard(): boolean { const a = this.accounts.find(x => String(x.id) === this.accountId); return !!a && a.type === 'credit_card'; }
  get hasPrevious(): boolean { return !!this.info && this.info.opening_balance !== null; }
  get accountName(): string { return this.accounts.find(x => String(x.id) === this.accountId)?.name || ''; }

  onAccount(): void {
    this.info = null; this.fieldErrors = {}; this.formError = '';
    if (!this.accountId) return;
    this.loadingInfo = true;
    this.api.reconStart(Number(this.accountId)).subscribe({
      next: i => { this.info = i; this.loadingInfo = false; },
      error: e => { this.loadingInfo = false; this.formError = toProblem(e).message; }
    });
  }

  // ---- step 1 ----
  private num(v: string): number | null { const t = String(v).trim(); if (t === '') return null; const n = Number(t); return isNaN(n) ? NaN : n; }

  start(): void {
    this.fieldErrors = {}; this.formError = '';
    if (!this.accountId) { this.fieldErrors['account'] = 'Choose the account you are reconciling.'; return; }
    if (!this.f.end) { this.fieldErrors['end'] = 'Enter the date the statement ends.'; return; }
    if (this.info?.last_statement_end && this.f.end <= this.info.last_statement_end) { this.fieldErrors['end'] = `Choose a date after your last reconciliation (${this.info.last_statement_end}).`; return; }
    const closing = this.num(this.f.closing);
    if (closing === null || isNaN(closing)) { this.fieldErrors['closing'] = 'Enter the closing balance from your statement, for example 4250.75.'; return; }
    if (!this.hasPrevious) {
      const o = this.num(this.f.opening);
      if (o === null || isNaN(o)) { this.fieldErrors['opening'] = 'Enter the opening balance from your statement. Use 0 if the account was new.'; return; }
    }
    this.starting = true;
    this.api.reconLines(Number(this.accountId), this.f.end).subscribe({
      next: r => { this.starting = false; this.lines = r.lines; this.truncated = r.truncated; this.ticked.clear(); this.step = 'working'; },
      error: e => { this.starting = false; const pr = toProblem(e); this.fieldErrors = pr.fieldErrors; this.formError = pr.message; }
    });
  }

  // ---- step 2: the sums, in whole cents ----
  private cents(v: number): number { return Math.round(v * 100); }
  get openingCents(): number { return this.cents(this.hasPrevious ? this.info!.opening_balance! : Number(this.f.opening)); }
  get closingCents(): number { return this.cents(Number(this.f.closing)); }
  get tickedCents(): number { let s = 0; this.lines.forEach(l => { if (this.ticked.has(l.id)) s += this.cents(l.amount); }); return s; }
  get diffCents(): number { return this.closingCents - (this.openingCents + this.tickedCents); }
  get balanced(): boolean { return this.diffCents === 0; }
  money(cents: number): string { return (cents < 0 ? '-' : '') + '$' + (Math.abs(cents) / 100).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  get allTicked(): boolean { return this.lines.length > 0 && this.lines.every(l => this.ticked.has(l.id)); }
  toggle(l: ReconLine, on: boolean): void { on ? this.ticked.add(l.id) : this.ticked.delete(l.id); }
  toggleAll(on: boolean): void { this.lines.forEach(l => on ? this.ticked.add(l.id) : this.ticked.delete(l.id)); }
  back(): void { this.step = 'setup'; this.ticked.clear(); this.lines = []; }

  finish(): void {
    if (!this.balanced || this.finishing) return;
    this.finishing = true;
    this.api.reconFinish(Number(this.accountId), {
      statement_end: this.f.end, closing_balance: Number(this.f.closing),
      opening_balance: this.hasPrevious ? null : Number(this.f.opening), ids: Array.from(this.ticked)
    }).subscribe({
      next: r => { this.finishing = false; this.doneMessage = r.message; this.step = 'done'; },
      error: e => { this.finishing = false; this.alerts.DangerSwalnew('This could not be finished', toProblem(e).message); }
    });
  }

  // ---- step 3 / history ----
  again(): void { this.step = 'setup'; this.f = { end: '', closing: '', opening: '' }; this.lines = []; this.ticked.clear(); this.onAccount(); }

  async undo(id: number): Promise<void> {
    if (!(await this.alerts.confirm('Undo this reconciliation?', 'Its transactions go back to unreconciled so you can do it again. Your statement balance is not changed.', 'Undo'))) return;
    this.busyId = id;
    this.api.reconUndo(id).subscribe({
      next: () => { this.busyId = null; this.onAccount(); },
      error: e => { this.busyId = null; this.alerts.DangerSwalnew('That did not work', toProblem(e).message); }
    });
  }
}

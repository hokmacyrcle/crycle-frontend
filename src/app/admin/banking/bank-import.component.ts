import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { toProblem } from '../sales/sales.service';
import { BankAccount, ColumnMap, ImportPreview, ImportResult } from './banking.models';
import { BankingService } from './banking.service';
import { downloadSample, SampleKind } from './sample-csv';

/** Import a CSV statement: choose the file, check the columns, import. */
@Component({
  selector: 'app-bank-import',
  templateUrl: './bank-import.component.html'
})
export class BankImportComponent implements OnInit {
  accountId = 0;
  account: BankAccount | null = null;
  accounts: BankAccount[] = [];
  file: File | null = null;
  preview: ImportPreview | null = null;
  map: ColumnMap = { date: null, description: null, amount: null, debit: null, credit: null, balance: null };
  split = false;
  hasHeader = true;
  outflowPositive = false;
  busy = false;
  error = '';
  result: ImportResult | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private api: BankingService, private alerts: AlertService) { }

  ngOnInit(): void {
    this.accountId = Number(this.route.snapshot.paramMap.get('id')) || 0;
    this.api.accounts().subscribe({
      next: a => { this.accounts = a; this.pick(this.accountId); if (this.accountId && !this.account) this.error = 'We could not find that account.'; },
      error: e => this.error = toProblem(e).message
    });
  }

  /** Choose which account the file belongs to. Changing it starts the file choice again. */
  pick(id: number | null): void {
    this.accountId = id || 0;
    this.account = this.accounts.find(x => x.id === this.accountId) || null;
    this.file = null; this.preview = null; this.error = '';
  }

  sample(kind: SampleKind): void { downloadSample(kind); }

  chooseFile(ev: Event): void {
    const f = (ev.target as HTMLInputElement).files?.[0];
    if (!f || !this.accountId) return;
    this.file = f; this.preview = null; this.error = ''; this.busy = true;
    this.api.previewImport(this.accountId, f).subscribe({
      next: p => {
        this.busy = false; this.preview = p;
        this.map = { ...p.mapping }; this.split = p.split_suggested;
        this.hasHeader = p.has_header; this.outflowPositive = p.outflow_positive_suggested;
      },
      error: e => { this.busy = false; this.file = null; this.error = toProblem(e).message; }
    });
  }

  get ready(): boolean {
    const m = this.map;
    if (m.date === null || m.description === null) return false;
    return this.split ? (m.debit !== null && m.credit !== null) : m.amount !== null;
  }

  colName(i: number): string { return this.preview?.headers[i] || 'Column ' + (i + 1); }

  import(): void {
    if (!this.file || !this.ready) return;
    const m: ColumnMap = { ...this.map, amount: this.split ? null : this.map.amount, debit: this.split ? this.map.debit : null, credit: this.split ? this.map.credit : null };
    this.busy = true; this.error = '';
    this.api.runImport(this.accountId, this.file, m, this.hasHeader, this.outflowPositive).subscribe({
      next: r => { this.busy = false; this.result = r.data; this.alerts.toast(r.message); },
      error: e => { this.busy = false; this.error = toProblem(e).message; }
    });
  }

  async undo(): Promise<void> {
    if (!this.result) return;
    if (!(await this.alerts.confirm('Undo this import?', 'The transactions from this file that you have not reviewed are removed.', 'Undo import'))) return;
    this.api.undoImport(this.result.import_id).subscribe({
      next: r => { this.alerts.toast(r.message); this.router.navigate(['/admin/Banktransactions/transactions'], { queryParams: { account: this.accountId } }); },
      error: e => this.alerts.DangerSwalnew('That did not work', toProblem(e).message)
    });
  }

  done(): void { this.router.navigate(['/admin/Banktransactions/transactions'], { queryParams: { account: this.accountId } }); }
}

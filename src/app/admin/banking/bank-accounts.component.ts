import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { toProblem } from '../sales/sales.service';
import { ACCOUNT_TYPES, AccountPayload, AccountType, BankAccount } from './banking.models';
import { BankingService } from './banking.service';

/** Banking home: one card per bank account, with Add account and Archive. */
@Component({
  selector: 'app-bank-accounts',
  templateUrl: './bank-accounts.component.html'
})
export class BankAccountsComponent implements OnInit {
  types = ACCOUNT_TYPES;
  accounts: BankAccount[] = [];
  showArchived = false;
  loading = true;
  error = '';

  formOpen = false;
  editId: number | null = null;
  m: { name: string; type: AccountType; bsb: string; account_number: string } = this.blank();
  saving = false;
  fieldErrors: Record<string, string> = {};
  formError = '';

  constructor(private api: BankingService, private alerts: AlertService) { }

  ngOnInit(): void { this.load(); }

  private blank() { return { name: '', type: 'everyday' as AccountType, bsb: '', account_number: '' }; }
  get isCard(): boolean { return this.m.type === 'credit_card'; }
  err(k: string): string { return this.fieldErrors[k] || ''; }

  load(): void {
    this.loading = true; this.error = '';
    this.api.accounts(this.showArchived).subscribe({
      next: a => { this.accounts = a; this.loading = false; },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }

  setArchived(v: boolean): void { this.showArchived = v; this.formOpen = false; this.load(); }

  openAdd(): void { this.editId = null; this.m = this.blank(); this.fieldErrors = {}; this.formError = ''; this.formOpen = true; }

  openEdit(a: BankAccount): void {
    this.editId = a.id;
    this.m = { name: a.name, type: a.type, bsb: a.bsb || '', account_number: a.account_number || '' };
    this.fieldErrors = {}; this.formError = ''; this.formOpen = true;
  }

  save(): void {
    this.fieldErrors = {}; this.formError = '';
    if (!this.m.name.trim()) { this.fieldErrors['name'] = 'Give the account a name, for example Business everyday.'; return; }
    const p: AccountPayload = {
      name: this.m.name.trim(), type: this.m.type,
      bsb: this.isCard ? null : (this.m.bsb.trim() || null),
      account_number: this.m.account_number.trim() || null
    };
    this.saving = true;
    const call = this.editId ? this.api.updateAccount(this.editId, p) : this.api.addAccount(p);
    call.subscribe({
      next: r => { this.saving = false; this.formOpen = false; this.alerts.toast(r.message); this.load(); },
      error: e => { this.saving = false; const pr = toProblem(e); this.fieldErrors = pr.fieldErrors; this.formError = pr.message; }
    });
  }

  async archive(a: BankAccount): Promise<void> {
    if (!a.active) { this.toggleArchive(a, false); return; }
    if (!(await this.alerts.confirm('Archive this account?', 'It is hidden from this list. Its transactions are kept and you can restore it any time.', 'Archive'))) return;
    this.toggleArchive(a, true);
  }

  private toggleArchive(a: BankAccount, archived: boolean): void {
    this.api.archiveAccount(a.id, archived).subscribe({
      next: r => { this.alerts.toast(r.message); this.load(); },
      error: e => this.alerts.DangerSwalnew('That did not work', toProblem(e).message)
    });
  }
}

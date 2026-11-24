import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { toProblem } from '../sales/sales.service';
import { ACCOUNT_TYPES, AccountType, FeedAccount, FeedAccounts, FeedConnectResult, FeedStatus, Institution } from './banking.models';
import { BankingService } from './banking.service';

type Step = 'loading' | 'unavailable' | 'banks' | 'consent' | 'connecting' | 'accounts' | 'done';
interface Pick { acct: FeedAccount; use: boolean; type: AccountType; }

/** Connect a bank: choose the bank, agree, choose which accounts to bring in, done. */
@Component({
  selector: 'app-bank-connect',
  templateUrl: './bank-connect.component.html'
})
export class BankConnectComponent implements OnInit {
  types = ACCOUNT_TYPES;
  step: Step = 'loading';
  status: FeedStatus | null = null;
  banks: Institution[] = [];
  search = '';
  bank: Institution | null = null;
  linkId = 0;
  found: FeedAccounts | null = null;
  picks: Pick[] = [];
  result: FeedConnectResult | null = null;
  busy = false;
  error = '';
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private api: BankingService, private alerts: AlertService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.api.feedStatus().subscribe({
      next: s => {
        this.status = s;
        if (!s.configured) { this.step = 'unavailable'; return; }
        // Back from the bank's own sign-in page: carry on with the connection we started.
        const saved = Number(sessionStorage.getItem('bank_link_id') || 0);
        if (this.route.snapshot.queryParamMap.get('return') && saved) { this.linkId = saved; this.loadAccounts(); return; }
        this.step = 'banks'; this.loadBanks();
      },
      error: e => { this.step = 'unavailable'; this.error = toProblem(e).message; }
    });
  }

  loadBanks(): void {
    this.error = '';
    this.api.institutions(this.search.trim()).subscribe({
      next: b => this.banks = b,
      error: e => this.error = toProblem(e).message
    });
  }

  onSearch(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.loadBanks(), 300);
  }

  choose(b: Institution): void { this.bank = b; this.step = 'consent'; this.error = ''; }

  back(): void { this.step = 'banks'; this.bank = null; this.error = ''; }

  agree(): void {
    if (!this.bank) return;
    this.step = 'connecting'; this.error = '';
    const returnUrl = `${window.location.origin}/admin/Banktransactions/connect?return=1`;
    this.api.startFeed(this.bank, returnUrl).subscribe({
      next: r => {
        this.linkId = r.link_id;
        if (r.url) { sessionStorage.setItem('bank_link_id', String(r.link_id)); window.location.href = r.url; return; }
        this.loadAccounts();
      },
      error: e => { this.step = 'consent'; this.error = toProblem(e).message; }
    });
  }

  loadAccounts(): void {
    this.step = 'connecting';
    this.api.feedAccounts(this.linkId).subscribe({
      next: f => {
        sessionStorage.removeItem('bank_link_id');
        this.found = f;
        this.picks = f.accounts.map(a => ({ acct: a, use: !a.already_connected, type: a.type || 'everyday' }));
        this.step = 'accounts';
      },
      error: e => { this.step = 'banks'; this.loadBanks(); this.error = toProblem(e).message; }
    });
  }

  get chosen(): number { return this.picks.filter(p => p.use && !p.acct.already_connected).length; }

  connect(): void {
    if (!this.chosen || this.busy) return;
    this.busy = true; this.error = '';
    const body = this.picks.filter(p => p.use && !p.acct.already_connected).map(p => ({
      ref: p.acct.ref, type: p.type, name: ((this.found?.institution_name || '') + ' ' + p.acct.name).trim()
    }));
    this.api.connectFeed(this.linkId, body).subscribe({
      next: r => { this.busy = false; this.result = r.data; this.step = 'done'; },
      error: e => { this.busy = false; this.error = toProblem(e).message; }
    });
  }

  finish(): void { this.router.navigate(['/admin/Banktransactions/transactions']); }
}

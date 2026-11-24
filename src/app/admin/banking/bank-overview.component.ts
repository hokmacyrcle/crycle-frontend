import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { toProblem } from '../sales/sales.service';
import { BankAccount, BankSummary } from './banking.models';
import { BankingService } from './banking.service';

/** Banking overview: what needs review, money in and out, and each account. */
@Component({
  selector: 'app-bank-overview',
  templateUrl: './bank-overview.component.html'
})
export class BankOverviewComponent implements OnInit {
  s: BankSummary | null = null;
  accounts: BankAccount[] = [];
  loading = true;
  error = '';

  constructor(private api: BankingService) { }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = '';
    forkJoin({ s: this.api.summary(), a: this.api.accounts() }).subscribe({
      next: r => { this.s = r.s; this.accounts = r.a; this.loading = false; },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }
}

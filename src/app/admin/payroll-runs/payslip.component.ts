import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toProblem } from '../sales/sales.service';
import { PayRunFull, PayRunLine } from './payrun.models';
import { PayRunService } from './payrun.service';

@Component({
  selector: 'app-payslip',
  template: `
<div class="mx-auto max-w-2xl text-cyrcle-navy">
  <div class="flex items-center justify-between gap-3 print:hidden">
    <a [routerLink]="['/admin/payroll/runs', runId]" class="inline-flex min-h-[40px] items-center gap-1 text-sm font-bold text-cyrcle-midnight"><app-icon name="arrow-left" [size]="16"></app-icon>Pay run</a>
    <button *ngIf="line" type="button" class="cy-btn-secondary" (click)="print()"><app-icon name="printer" [size]="18"></app-icon>Print or save PDF</button>
  </div>

  <div *ngIf="loading" class="mt-3 text-sm text-[#5B6478]">Loading…</div>
  <div *ngIf="error" class="cy-card mt-3 text-sm">{{ error }}</div>

  <article *ngIf="run && line" class="mt-3 rounded-[20px] bg-white p-5 sm:p-8 print:mt-0 print:rounded-none print:p-0" [attr.aria-label]="'Payslip for ' + line.employee_name">
    <header class="flex flex-col gap-4 sm:flex-row sm:justify-between">
      <div>
        <div class="text-[20px] font-extrabold leading-tight">{{ run.employer.name }}</div>
        <div *ngIf="run.employer.abn" class="mt-1 text-sm">ABN {{ run.employer.abn | abn }}</div>
        <div *ngFor="let a of run.employer.address" class="text-sm text-[#3C4663]">{{ a }}</div>
      </div>
      <div class="sm:text-right"><div class="text-[26px] font-extrabold leading-tight">Payslip</div><div class="mt-1 text-sm font-bold">{{ run.reference }}</div></div>
    </header>

    <dl class="m-0 mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
      <dt class="font-bold">Employee</dt><dd class="m-0">{{ line.employee_name }}</dd>
      <dt class="font-bold">Pay period</dt><dd class="m-0">{{ run.period_start | auDate }} to {{ run.period_end | auDate }}</dd>
      <dt class="font-bold">Pay date</dt><dd class="m-0">{{ run.pay_date | auDate }}</dd>
    </dl>

    <table class="mt-6 w-full border-collapse text-sm">
      <thead><tr class="border-b border-[#B9B39F] text-left"><th class="py-2 font-bold">Description</th><th class="py-2 text-right font-bold">Amount</th></tr></thead>
      <tbody>
        <tr class="border-b border-cyrcle-pearl">
          <td class="py-2.5">
            <ng-container *ngIf="line.pay_basis === 'hourly'">Ordinary hours: {{ line.hours }} hours at {{ line.hourly_rate | aud }}</ng-container>
            <ng-container *ngIf="line.pay_basis === 'salary'">Salary for the period</ng-container>
          </td>
          <td class="py-2.5 text-right">{{ line.gross | aud }}</td>
        </tr>
        <tr class="border-b border-cyrcle-pearl"><td class="py-2.5 font-bold">Gross pay</td><td class="py-2.5 text-right font-bold">{{ line.gross | aud }}</td></tr>
        <tr class="border-b border-cyrcle-pearl"><td class="py-2.5">Tax withheld (PAYG)</td><td class="py-2.5 text-right">-{{ line.tax | aud }}</td></tr>
        <tr><td class="py-3 text-[16px] font-extrabold">Net pay</td><td class="py-3 text-right text-[16px] font-extrabold">{{ line.net | aud }}</td></tr>
      </tbody>
    </table>

    <section class="mt-6 rounded-[16px] bg-[#F6F4EC] p-4 text-sm print:border print:border-gray-300 print:bg-white">
      <div class="font-bold">Superannuation</div>
      <div class="mt-1">{{ line.super_amount | aud }} (12%) paid on top of your pay<span *ngIf="run.super_due_date">, due to your fund by {{ run.super_due_date | auDate }}</span>.</div>
      <div *ngIf="line.super_fund_name" class="mt-1 text-[#3C4663]">{{ line.super_fund_name }}<span *ngIf="line.super_member_number"> · Member {{ line.super_member_number }}</span></div>
    </section>
  </article>
</div>`
})
export class PayslipComponent implements OnInit {
  runId = '';
  run: PayRunFull | null = null;
  line: PayRunLine | null = null;
  loading = true;
  error = '';

  constructor(private api: PayRunService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.runId = this.route.snapshot.paramMap.get('id') as string;
    const lineId = Number(this.route.snapshot.paramMap.get('lineId'));
    this.api.get(this.runId).subscribe({
      next: r => {
        this.loading = false;
        if (r.status !== 'finalised') { this.error = 'Payslips are available once the pay run is finalised.'; return; }
        const l = r.lines.find(x => x.id === lineId);
        if (!l) { this.error = 'We could not find that payslip.'; return; }
        this.run = r; this.line = l;
      },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }

  print(): void {
    if (!this.run || !this.line) return;
    const previous = document.title;
    document.title = `Payslip ${this.line.employee_name} ${this.run.period_end}`;
    const restore = () => { document.title = previous; window.removeEventListener('afterprint', restore); };
    window.addEventListener('afterprint', restore);
    window.print();
  }
}

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
      <ng-container *ngIf="line.pay_basis === 'salary' && line.annual_salary"><dt class="font-bold">Annual salary</dt><dd class="m-0">{{ line.annual_salary | aud }}</dd></ng-container>
      <ng-container *ngIf="line.hourly_rate"><dt class="font-bold">Hourly rate</dt><dd class="m-0">{{ line.hourly_rate | aud }}</dd></ng-container>
      <dt class="font-bold">Pay period</dt><dd class="m-0">{{ run.period_start | auDate }} to {{ run.period_end | auDate }}</dd>
      <dt class="font-bold">Pay date</dt><dd class="m-0">{{ run.pay_date | auDate }}</dd>
    </dl>

    <div class="mt-6 overflow-x-auto">
    <table class="w-full border-collapse text-sm">
      <thead><tr class="border-b border-[#B9B39F] text-left">
        <th class="py-2 font-bold">Description</th><th class="hidden py-2 text-right font-bold sm:table-cell">Hours</th><th class="hidden py-2 text-right font-bold sm:table-cell">Rate</th>
        <th class="py-2 text-right font-bold">Amount</th><th class="hidden py-2 text-right font-bold sm:table-cell">Year to date</th>
      </tr></thead>
      <tbody>
        <tr class="border-b border-cyrcle-pearl">
          <td class="py-2.5"><ng-container *ngIf="line.pay_basis === 'hourly'">Ordinary hours</ng-container><ng-container *ngIf="line.pay_basis === 'salary'">Salary for the period</ng-container><span *ngIf="line.pay_basis === 'hourly'" class="block text-[12px] text-[#5B6478] sm:hidden">{{ line.hours }} hours at {{ line.hourly_rate | aud }}</span></td>
          <td class="hidden py-2.5 text-right sm:table-cell">{{ line.pay_basis === 'hourly' ? line.hours : '' }}</td>
          <td class="hidden py-2.5 text-right sm:table-cell">{{ line.pay_basis === 'hourly' && line.hourly_rate ? (line.hourly_rate | aud) : '' }}</td>
          <td class="py-2.5 text-right">{{ line.base_pay | aud }}</td>
          <td class="hidden py-2.5 text-right sm:table-cell">{{ line.ytd ? (line.ytd.base_pay | aud) : '' }}</td>
        </tr>
        <tr *ngFor="let i of earnings; let n = index" class="border-b border-cyrcle-pearl">
          <td class="py-2.5">{{ i.label }}<span *ngIf="i.label.toLowerCase() !== i.kind" class="text-[#5B6478]"> ({{ kindName(i.kind) }})</span><span *ngIf="i.hours" class="block text-[12px] text-[#5B6478] sm:hidden">{{ i.hours }} hours<span *ngIf="i.rate"> at {{ i.rate | aud }}</span></span></td>
          <td class="hidden py-2.5 text-right sm:table-cell">{{ i.hours ?? '' }}</td>
          <td class="hidden py-2.5 text-right sm:table-cell">{{ i.rate ? (i.rate | aud) : '' }}</td>
          <td class="py-2.5 text-right">{{ i.amount | aud }}</td>
          <td class="hidden py-2.5 text-right sm:table-cell">{{ firstOfKind(earnings, n) && line.ytd ? (line.ytd.items[i.kind] | aud) : '' }}</td>
        </tr>
        <tr class="border-b border-cyrcle-pearl"><td class="py-2.5 font-bold">Gross pay</td><td class="hidden sm:table-cell" colspan="2"></td><td class="py-2.5 text-right font-bold">{{ line.gross | aud }}</td><td class="hidden sm:table-cell py-2.5 text-right font-bold">{{ line.ytd ? (line.ytd.gross | aud) : '' }}</td></tr>
        <tr class="border-b border-cyrcle-pearl"><td class="py-2.5">Tax withheld (PAYG)<span *ngIf="line.study_loan > 0" class="block text-[12px] text-[#5B6478]">includes {{ line.study_loan | aud }} study and training loan repayment</span></td><td class="hidden sm:table-cell" colspan="2"></td><td class="py-2.5 text-right">-{{ line.tax | aud }}</td><td class="hidden sm:table-cell py-2.5 text-right">{{ line.ytd ? (line.ytd.tax | aud) : '' }}</td></tr>
        <tr *ngFor="let i of reimbursements; let n = index" class="border-b border-cyrcle-pearl"><td class="py-2.5">{{ i.label }} <span class="text-[#5B6478]">(reimbursement)</span></td><td class="hidden sm:table-cell" colspan="2"></td><td class="py-2.5 text-right">{{ i.amount | aud }}</td><td class="hidden sm:table-cell py-2.5 text-right">{{ n === 0 && line.ytd ? (line.ytd.items.reimbursement | aud) : '' }}</td></tr>
        <tr *ngFor="let i of deductions; let n = index" class="border-b border-cyrcle-pearl"><td class="py-2.5">{{ i.label }} <span class="text-[#5B6478]">(deduction)</span><span *ngIf="i.payee" class="block text-[12px] text-[#5B6478]">Paid to {{ i.payee }}</span></td><td class="hidden sm:table-cell" colspan="2"></td><td class="py-2.5 text-right">-{{ i.amount | aud }}</td><td class="hidden sm:table-cell py-2.5 text-right">{{ n === 0 && line.ytd ? (line.ytd.items.deduction | aud) : '' }}</td></tr>
        <tr><td class="py-3 text-[16px] font-extrabold">Net pay</td><td class="hidden sm:table-cell" colspan="2"></td><td class="py-3 text-right text-[16px] font-extrabold">{{ line.net | aud }}</td><td class="hidden sm:table-cell py-3 text-right font-bold">{{ line.ytd ? (line.ytd.net | aud) : '' }}</td></tr>
      </tbody>
    </table>
    </div>

    <section *ngIf="line.leave_taken.length" class="mt-5 text-sm">
      <div class="font-bold">Leave taken in this period</div>
      <div *ngFor="let t of line.leave_taken" class="mt-1">{{ t.type }}: {{ t.hours }} hours, {{ t.start_date | auDate }} to {{ t.end_date | auDate }}</div>
    </section>

    <section *ngIf="line.entitlements.length" class="mt-5 text-sm">
      <div class="font-bold">Leave entitlements <span class="font-normal text-[#5B6478]">(hours, as at the pay date)</span></div>
      <table class="mt-2 w-full border-collapse">
        <thead><tr class="border-b border-[#B9B39F] text-left"><th class="py-1.5 font-bold">Leave type</th><th class="py-1.5 text-right font-bold">Built up this pay</th><th class="py-1.5 text-right font-bold">Balance</th></tr></thead>
        <tbody><tr *ngFor="let e of line.entitlements" class="border-b border-cyrcle-pearl"><td class="py-1.5">{{ e.type }}</td><td class="py-1.5 text-right">{{ e.accrued }}</td><td class="py-1.5 text-right">{{ e.balance }}</td></tr></tbody>
      </table>
    </section>

    <section class="mt-6 rounded-[16px] bg-[#F6F4EC] p-4 text-sm print:border print:border-gray-300 print:bg-white">
      <div class="font-bold">Superannuation</div>
      <div class="mt-1">{{ line.super_amount | aud }} ({{ run.super_rate }}%) paid on top of your pay<span *ngIf="run.super_due_date">, due to your fund by {{ run.super_due_date | auDate }}</span>.</div>
      <div *ngIf="line.super_fund_name" class="mt-1 text-[#3C4663]">{{ line.super_fund_name }}<span *ngIf="line.super_member_number"> · Member {{ line.super_member_number }}</span></div>
    </section>

    <div *ngIf="line.ytd" class="mt-4 text-[12px] text-[#5B6478]">Year to date runs from 1 July {{ fyStart }} to this pay date. Super paid so far this year: {{ line.ytd.super | aud }}.</div>
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

  get earnings() { return (this.line?.items ?? []).filter(i => i.kind !== 'reimbursement' && i.kind !== 'deduction'); }
  get reimbursements() { return (this.line?.items ?? []).filter(i => i.kind === 'reimbursement'); }
  get deductions() { return (this.line?.items ?? []).filter(i => i.kind === 'deduction'); }
  kindName(k: string): string { return k === 'leave' ? 'leave' : k; }
  /** True for the first row of its kind, where that kind's year to date total is shown. */
  firstOfKind(list: { kind: string }[], index: number): boolean { return list.findIndex(x => x.kind === list[index].kind) === index; }

  /** The calendar year the financial year started in. */
  get fyStart(): number {
    const d = new Date((this.run?.pay_date ?? '') + 'T00:00:00');
    return d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
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

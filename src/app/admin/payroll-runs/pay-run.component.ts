import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { toProblem } from '../sales/sales.service';
import { LineChange, PayRunFull, PayRunLine } from './payrun.models';
import { PayRunService } from './payrun.service';

@Component({
  selector: 'app-pay-run',
  templateUrl: './pay-run.component.html'
})
export class PayRunComponent implements OnInit {
  run: PayRunFull | null = null;
  loading = true;
  error = '';
  busyLine: number | null = null;
  busy = false;
  banner = '';
  taxEdit: Record<number, string> = {};
  lineError: Record<number, string> = {};

  constructor(private api: PayRunService, private route: ActivatedRoute, private router: Router, private alerts: AlertService) { }

  ngOnInit(): void {
    this.api.get(this.route.snapshot.paramMap.get('id') as string).subscribe({
      next: r => { this.run = r; this.loading = false; },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }

  get editable(): boolean { return !!this.run?.can.edit; }

  /** True while a line still needs hours, or tax that a person must check. */
  needs(l: PayRunLine): boolean {
    return (l.pay_basis === 'hourly' && l.hours === null) || (l.tax_status !== 'auto' && !l.tax_confirmed);
  }

  private change(l: PayRunLine, body: LineChange, done?: string): void {
    if (!this.run) return;
    this.busyLine = l.id; this.lineError[l.id] = '';
    this.api.updateLine(this.run.id, l.id, body).subscribe({
      next: r => { this.run = r; this.busyLine = null; delete this.taxEdit[l.id]; if (done) this.alerts.toast(done); },
      error: e => { this.busyLine = null; const p = toProblem(e); this.lineError[l.id] = p.fieldErrors['hours'] || p.fieldErrors['tax_override'] || p.message; }
    });
  }

  setHours(l: PayRunLine, value: string): void {
    const v = value.trim();
    const n = v === '' ? null : Number(v);
    if (n !== null && (isNaN(n) || n < 0)) { this.lineError[l.id] = 'Enter hours as a number, for example 38 or 7.5.'; return; }
    if (n === l.hours) return;
    this.change(l, { hours: n });
  }

  startTax(l: PayRunLine): void { this.taxEdit[l.id] = l.tax.toFixed(2); }
  cancelTax(l: PayRunLine): void { delete this.taxEdit[l.id]; this.lineError[l.id] = ''; }
  saveTax(l: PayRunLine): void {
    const n = Number((this.taxEdit[l.id] ?? '').trim());
    if ((this.taxEdit[l.id] ?? '').trim() === '' || isNaN(n) || n < 0) { this.lineError[l.id] = 'Enter the tax as a dollar amount, for example 412.00.'; return; }
    this.change(l, { tax_override: n }, 'Tax updated');
  }
  useCalculated(l: PayRunLine): void { this.change(l, { clear_tax_override: true }, 'Back to the calculated tax'); }
  confirmTax(l: PayRunLine): void { this.change(l, { confirm_tax: true }, 'Tax confirmed'); }

  async removeLine(l: PayRunLine): Promise<void> {
    if (!this.run) return;
    if (!(await this.alerts.confirm('Remove ' + l.employee_name + '?', 'They will not be paid in this run. Nothing else changes.', 'Remove'))) return;
    this.busyLine = l.id;
    this.api.removeLine(this.run.id, l.id).subscribe({
      next: r => { this.run = r; this.busyLine = null; },
      error: e => { this.busyLine = null; this.alerts.DangerSwalnew('That did not work', toProblem(e).message); }
    });
  }

  async finalise(): Promise<void> {
    if (!this.run) return;
    this.banner = '';
    if (this.run.needs_attention) { this.banner = 'Some lines still need your attention. They are marked below.'; return; }
    const ok = await this.alerts.confirm('Finalise ' + this.run.reference + '?', 'Once finalised, this pay run and its payslips cannot be changed.', 'Finalise');
    if (!ok) return;
    this.busy = true;
    this.api.finalise(this.run.id).subscribe({
      next: r => { this.run = r; this.busy = false; this.alerts.toast('Pay run finalised'); },
      error: e => { this.busy = false; const p = toProblem(e); this.banner = p.fieldErrors['lines'] ? p.message + ' ' + p.fieldErrors['lines'] : p.message; }
    });
  }

  setSuperPaid(paid: boolean): void {
    if (!this.run) return;
    this.busy = true;
    this.api.setSuperPaid(this.run.id, paid).subscribe({
      next: r => { this.run = r; this.busy = false; this.alerts.toast(paid ? 'Super marked as paid' : 'Super marked as not paid'); },
      error: e => { this.busy = false; this.alerts.DangerSwalnew('That did not work', toProblem(e).message); }
    });
  }

  async discard(): Promise<void> {
    if (!this.run) return;
    if (!(await this.alerts.confirm('Delete this draft?', 'The draft ' + this.run.reference + ' will be removed. You can start a new one any time.', 'Delete'))) return;
    this.busy = true;
    this.api.remove(this.run.id).subscribe({
      next: () => { this.router.navigate(['/admin/payroll/runs']); },
      error: e => { this.busy = false; this.alerts.DangerSwalnew('That did not work', toProblem(e).message); }
    });
  }

  print(): void {
    if (!this.run) return;
    const previous = document.title;
    document.title = `Pay run ${this.run.reference} - ${this.run.employer.name}`;
    const restore = () => { document.title = previous; window.removeEventListener('afterprint', restore); };
    window.addEventListener('afterprint', restore);
    window.print();
  }
}

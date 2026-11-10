import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { Doc, DocKind, Payment } from './sales.models';
import { SalesService, toProblem } from './sales.service';
import { Totals, computeTotals } from './sales-totals';
import { PAYMENT_METHODS, STATUS_LABEL, today } from './sales.labels';

/** One invoice or quote: how it will look to the customer, plus what you can do with it. */
@Component({
  selector: 'app-doc-view',
  templateUrl: './doc-view.component.html'
})
export class DocViewComponent implements OnInit {
  kind: DocKind = 'invoice';
  doc: Doc | null = null;
  calc: Totals | null = null;
  loading = true;
  error = '';
  busy = false;
  menuOpen = false;

  payOpen = false;
  methods = PAYMENT_METHODS;
  pay = { amount: null as number | null, date: today(), method: 'Bank transfer', reference: '', notes: '' };
  payErrors: Record<string, string> = {};
  payBanner = '';
  label = STATUS_LABEL;
  maxDate = today();

  constructor(private api: SalesService, private route: ActivatedRoute, private router: Router, private alerts: AlertService) { }

  get isInvoice(): boolean { return this.kind === 'invoice'; }
  get section(): string { return this.isInvoice ? 'invoices' : 'quotes'; }
  get showsGst(): boolean { return !!this.doc && this.doc.seller.gst_registered && this.doc.amounts_are !== 'no_gst'; }
  get editBusiness(): any[] {
    try {
      const id = JSON.parse(localStorage.getItem('selected_company') || '{}')?.company_id;
      return id ? ['/admin/companies', id, 'edit'] : ['/admin/companies'];
    } catch { return ['/admin/companies']; }
  }

  ngOnInit(): void {
    this.kind = this.route.snapshot.data['kind'];
    this.route.paramMap.subscribe(p => this.load(+(p.get('id') || 0)));
  }

  load(id: number): void {
    this.loading = true; this.error = '';
    this.api.get(this.kind, id).subscribe({
      next: d => { this.set(d); this.loading = false; },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }

  private set(d: Doc): void {
    this.doc = d;
    this.calc = computeTotals(d.lines, d.amounts_are, d.discount_method, d.discount_value);
  }

  back(): void { this.router.navigate(['/admin/sales', this.section]); }
  edit(): void { if (this.doc) this.router.navigate(['/admin/sales', this.section, this.doc.id, 'edit']); }

  private run(call: () => any, done?: (r: any) => void): void {
    this.busy = true; this.menuOpen = false;
    call().subscribe({
      next: (r: any) => { this.busy = false; if (r?.data?.id !== undefined && r?.data?.lines) this.set(r.data); if (r?.message) this.alerts.toast(r.message); done?.(r); },
      error: (e: unknown) => { this.busy = false; this.alerts.DangerSwalnew('That did not work', toProblem(e).message); }
    });
  }

  // ---- invoice actions
  issue(): void { if (this.doc) this.run(() => this.api.issueInvoice(this.doc!.id)); }

  async voidInvoice(): Promise<void> {
    if (!this.doc) return;
    this.menuOpen = false;
    if (!(await this.alerts.confirm('Void invoice ' + this.doc.number + '?', 'It stays in your records marked as void and cannot be paid. This cannot be undone.', 'Void invoice'))) return;
    this.run(() => this.api.voidInvoice(this.doc!.id));
  }

  async deleteDraft(): Promise<void> {
    if (!this.doc) return;
    this.menuOpen = false;
    if (!(await this.alerts.confirm('Delete this draft?', 'The draft ' + this.noun + ' will be removed.', 'Delete draft'))) return;
    this.run(() => this.api.remove(this.kind, this.doc!.id), () => this.back());
  }

  get noun(): string { return this.isInvoice ? 'invoice' : 'quote'; }

  openPay(): void {
    if (!this.doc) return;
    this.pay = { amount: this.doc.totals.amount_due ?? null, date: today(), method: 'Bank transfer', reference: '', notes: '' };
    this.payErrors = {}; this.payBanner = ''; this.payOpen = true;
    setTimeout(() => (document.getElementById('pay-amount') as HTMLInputElement | null)?.select());
  }

  @HostListener('document:keydown.escape') onEscape(): void { this.payOpen = false; this.menuOpen = false; }

  submitPay(): void {
    if (!this.doc) return;
    const e: Record<string, string> = {};
    if (!this.pay.amount || this.pay.amount <= 0) e['amount'] = 'Enter the amount received.';
    else if (this.pay.amount > (this.doc.totals.amount_due ?? 0) + 0.001) e['amount'] = 'That is more than the ' + this.fmt(this.doc.totals.amount_due ?? 0) + ' still owing.';
    if (!this.pay.date) e['date'] = 'Enter the date it was received.';
    else if (this.pay.date > this.maxDate) e['date'] = 'The payment date cannot be in the future.';
    this.payErrors = e; this.payBanner = '';
    if (Object.keys(e).length) return;

    this.busy = true;
    this.api.addPayment(this.doc.id, {
      amount: Number(this.pay.amount), date: this.pay.date, method: this.pay.method,
      reference: this.pay.reference.trim() || null, notes: this.pay.notes.trim() || null
    }).subscribe({
      next: r => { this.busy = false; this.payOpen = false; this.set(r.data); this.alerts.toast(r.message); },
      error: err => { this.busy = false; const p = toProblem(err); this.payErrors = p.fieldErrors; this.payBanner = p.message; }
    });
  }

  async removePayment(p: Payment): Promise<void> {
    if (!this.doc) return;
    if (!(await this.alerts.confirm('Remove this payment?', this.fmt(p.amount) + ' received on ' + p.date + ' will be taken off the invoice.', 'Remove payment'))) return;
    this.run(() => this.api.removePayment(this.doc!.id, p.id));
  }

  // ---- quote actions
  setStatus(status: 'sent' | 'accepted' | 'declined'): void { if (this.doc) this.run(() => this.api.setQuoteStatus(this.doc!.id, status)); }

  async convert(): Promise<void> {
    if (!this.doc) return;
    this.menuOpen = false;
    if (!(await this.alerts.confirm('Create an invoice from this quote?', 'A draft invoice with the same customer and lines is created. You can check it before issuing.', 'Create invoice'))) return;
    this.run(() => this.api.convertQuote(this.doc!.id), r => this.router.navigate(['/admin/sales/invoices', r.data.invoice_id]));
  }

  // ---- printing / saving as PDF
  print(): void {
    if (!this.doc) return;
    const previous = document.title;
    document.title = `${this.doc.title} ${this.doc.number} - ${this.doc.seller.name}`;
    const restore = () => { document.title = previous; window.removeEventListener('afterprint', restore); };
    window.addEventListener('afterprint', restore);
    window.print();
  }

  private fmt(n: number): string { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
}

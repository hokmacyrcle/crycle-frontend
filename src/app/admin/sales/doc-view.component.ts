import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { Doc, DocKind, Payment, ReminderDraft } from './sales.models';
import { SalesService, toProblem } from './sales.service';
import { Totals, computeTotals } from './sales-totals';
import { FREQUENCIES, PAYMENT_METHODS, STATUS_LABEL, today } from './sales.labels';

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

  remindOpen = false;
  remind: ReminderDraft | null = null;
  remindForm = { subject: '', body: '' };
  remindErrors: Record<string, string> = {};
  remindBanner = '';

  repeatOpen = false;
  frequencies = FREQUENCIES;
  repeat = { frequency: 'monthly', end_date: '' };
  repeatErrors: Record<string, string> = {};
  repeatBanner = '';

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

  openRemind(): void {
    if (!this.doc) return;
    this.busy = true; this.remindErrors = {}; this.remindBanner = '';
    this.api.reminderDraft(this.doc.id).subscribe({
      next: r => { this.busy = false; this.remind = r.data; this.remindForm = { subject: r.data.subject, body: r.data.body }; this.remindOpen = true; },
      error: e => { this.busy = false; this.alerts.DangerSwalnew('That did not work', toProblem(e).message); }
    });
  }

  /** Checks the message, runs the action (copy or open email) straight away while the tap is still fresh, then records the reminder. */
  private sendReminder(action: (subject: string, body: string) => void): void {
    if (!this.doc) return;
    const subject = this.remindForm.subject.trim(), body = this.remindForm.body.trim();
    const e: Record<string, string> = {};
    if (!subject) e['subject'] = 'Enter a subject.';
    if (!body) e['body'] = 'Enter the message.';
    this.remindErrors = e; this.remindBanner = '';
    if (Object.keys(e).length) return;
    action(subject, body);
    this.busy = true;
    this.api.recordReminder(this.doc.id, { subject, body }).subscribe({
      next: () => { this.busy = false; this.remindOpen = false; this.load(this.doc!.id); },
      error: err => { this.busy = false; const p = toProblem(err); this.remindErrors = p.fieldErrors; this.remindBanner = p.message; }
    });
  }

  openInEmailApp(): void {
    this.sendReminder((subject, body) => {
      window.location.href = 'mailto:' + encodeURIComponent(this.remind?.to || '') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  copyReminder(): void {
    this.sendReminder((subject, body) => {
      navigator.clipboard?.writeText(subject + '\n\n' + body).then(
        () => this.alerts.toast('Message copied. Paste it into your email or text.'),
        () => this.alerts.toast('Reminder recorded, but the message could not be copied.'));
    });
  }

  openRepeat(): void {
    this.repeat = { frequency: 'monthly', end_date: '' }; this.repeatErrors = {}; this.repeatBanner = ''; this.repeatOpen = true;
  }

  submitRepeat(): void {
    if (!this.doc) return;
    this.busy = true; this.repeatErrors = {}; this.repeatBanner = '';
    this.api.createRecurring({ invoice_id: this.doc.id, frequency: this.repeat.frequency, end_date: this.repeat.end_date || null }).subscribe({
      next: r => { this.busy = false; this.repeatOpen = false; this.alerts.toast(r.message + ' Next draft: ' + r.data.next_date.split('-').reverse().join('/') + '.'); },
      error: err => { this.busy = false; const p = toProblem(err); this.repeatErrors = p.fieldErrors; this.repeatBanner = p.message; }
    });
  }

  @HostListener('document:keydown.escape') onEscape(): void { this.remindOpen = false; this.repeatOpen = false; this.payOpen = false; this.menuOpen = false; }

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

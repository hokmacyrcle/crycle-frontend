import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';
import { BusinessInfo, Doc, DocKind, DocPayload, PickCustomer } from './sales.models';
import { SalesService, toProblem } from './sales.service';
import { AmountsAre, DiscountMethod, GST_RATE, Totals, computeTotals } from './sales-totals';
import { TERMS, addDays, dueFromTerm, iso, termKeyFor, today } from './sales.labels';

interface FormLine { description: string; quantity: number | null; rate: number | null; gst_rate: number; }

const MAX_TOTAL = 9999999.99;

/** New / edit screen for invoices and quotes (same form, chosen by the route). */
@Component({
  selector: 'app-doc-form',
  templateUrl: './doc-form.component.html'
})
export class DocFormComponent implements OnInit {
  kind: DocKind = 'invoice';
  id: number | null = null;
  doc: Doc | null = null;
  loading = true;
  saving = false;
  loadError = '';
  submitted = false;
  banner = '';

  business: BusinessInfo | null = null;
  customers: PickCustomer[] = [];

  customerId: number | null = null;
  issueDate = today();
  termKey = '14';
  dueDate = '';           // invoice due date, or quote "valid until"
  reference = '';
  amountsAre: AmountsAre = 'exclusive';
  discountOn = false;
  discountMethod: DiscountMethod = 'percentage';
  discountValue: number | null = null;
  notes = '';
  terms = '';             // quotes: terms and conditions
  lines: FormLine[] = [{ description: '', quantity: 1, rate: null, gst_rate: GST_RATE }];

  errors: Record<string, string> = {};
  termOptions = TERMS;
  validOptions = [
    { key: '14', label: 'Valid for 14 days' }, { key: '30', label: 'Valid for 30 days' },
    { key: '60', label: 'Valid for 60 days' }, { key: 'custom', label: 'Choose a date' },
  ];

  constructor(private api: SalesService, private route: ActivatedRoute, private router: Router, private alerts: AlertService) { }

  get isInvoice(): boolean { return this.kind === 'invoice'; }
  get noun(): string { return this.isInvoice ? 'invoice' : 'quote'; }
  get gstRegistered(): boolean { return !!this.business?.gst_registered; }
  get editing(): boolean { return this.id !== null; }
  get isDraft(): boolean { return !this.doc || this.doc.status === 'draft'; }
  get options() { return this.isInvoice ? this.termOptions : this.validOptions; }

  get totals(): Totals {
    return computeTotals(
      this.lines.map(l => ({ quantity: l.quantity ?? 0, rate: l.rate ?? 0, gst_rate: l.gst_rate })),
      this.gstRegistered ? this.amountsAre : 'no_gst',
      this.discountMethod,
      this.discountOn ? (this.discountValue ?? 0) : 0
    );
  }

  ngOnInit(): void {
    this.kind = this.route.snapshot.data['kind'];
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? +idParam : null;
    this.termKey = this.isInvoice ? '14' : '30';

    forkJoin({
      business: this.api.business(),
      customers: this.api.customerPicker(),
      doc: this.id ? this.api.get(this.kind, this.id) : of(null)
    }).subscribe({
      next: r => {
        this.business = r.business;
        this.customers = r.customers;
        if (!r.business.gst_registered) this.amountsAre = 'no_gst';
        if (r.doc) {
          this.fromDoc(r.doc);
        } else {
          const pre = +(this.route.snapshot.queryParamMap.get('customer') || 0);
          if (pre && this.customers.some(c => c.id === pre)) this.customerId = pre;
          this.applyTerm();
        }
        this.loading = false;
      },
      error: e => { this.loading = false; this.loadError = toProblem(e).message; }
    });
  }

  private fromDoc(d: Doc): void {
    this.doc = d;
    if (!d.can['edit']) {
      this.alerts.DangerSwalnew('This ' + this.noun + ' cannot be changed', d.status === 'paid' ? 'It has been paid.' : 'Its status is ' + d.status + '.');
      this.router.navigate(['/admin/sales', this.isInvoice ? 'invoices' : 'quotes', d.id]);
      return;
    }
    this.customerId = d.customer?.id ?? null;
    this.issueDate = d.issue_date;
    this.reference = d.reference ?? '';
    this.amountsAre = this.gstRegistered ? d.amounts_are : 'no_gst';
    this.notes = d.notes ?? '';
    this.discountMethod = d.discount_method;
    this.discountValue = d.discount_value || null;
    this.discountOn = d.discount_value > 0;
    if (this.isInvoice) {
      this.dueDate = d.due_date ?? '';
      this.termKey = termKeyFor(d.terms);
    } else {
      this.dueDate = d.expiry_date ?? '';
      this.terms = d.terms ?? '';
      const days = Math.round((new Date(this.dueDate + 'T00:00:00').getTime() - new Date(this.issueDate + 'T00:00:00').getTime()) / 86400000);
      this.termKey = [14, 30, 60].includes(days) ? String(days) : 'custom';
    }
    this.lines = d.lines.map(l => ({ description: l.description, quantity: l.quantity, rate: l.rate, gst_rate: l.gst_rate }));
    if (!this.lines.length) this.lines = [{ description: '', quantity: 1, rate: null, gst_rate: GST_RATE }];
  }

  // ---- dates
  applyTerm(): void {
    if (this.termKey === 'custom') return;
    if (this.isInvoice) {
      this.dueDate = dueFromTerm(this.termKey, this.issueDate) ?? this.dueDate;
    } else {
      this.dueDate = addDays(this.issueDate, +this.termKey);
    }
  }

  onIssueDateChange(): void { this.applyTerm(); }
  onDueDateTyped(): void { this.termKey = 'custom'; }

  // ---- lines
  addLine(): void { this.lines.push({ description: '', quantity: 1, rate: null, gst_rate: GST_RATE }); }
  removeLine(i: number): void { if (this.lines.length > 1) this.lines.splice(i, 1); }

  err(key: string): string { return this.submitted || this.errors[key] ? (this.errors[key] || '') : ''; }

  // ---- checking before sending (the server checks again)
  private validate(): boolean {
    const e: Record<string, string> = {};
    if (!this.customerId) e['customer_id'] = 'Choose a customer.';
    if (!this.issueDate) e['issue_date'] = 'Enter the ' + this.noun + ' date.';
    if (!this.dueDate) e['due_date'] = this.isInvoice ? 'Enter the due date.' : 'Enter how long the quote is valid for.';
    else if (this.issueDate && this.dueDate < this.issueDate) e['due_date'] = this.isInvoice ? 'The due date cannot be before the invoice date.' : 'The quote cannot expire before its date.';
    this.lines.forEach((l, i) => {
      if (!l.description.trim()) e[`lines.${i}.description`] = 'Describe what you are charging for.';
      if (!l.quantity || l.quantity <= 0) e[`lines.${i}.quantity`] = 'Enter a quantity.';
      if (l.rate === null || l.rate === undefined || (l.rate as unknown) === '' || l.rate < 0) e[`lines.${i}.rate`] = 'Enter a price.';
    });
    if (this.discountOn && this.discountMethod === 'percentage' && (this.discountValue ?? 0) > 100) e['discount_value'] = 'A percentage discount cannot be more than 100.';
    if (this.totals.gross > MAX_TOTAL) e['lines'] = 'The total is too large. The most you can enter is $9,999,999.99.';
    this.errors = e;
    return Object.keys(e).length === 0;
  }

  private payload(action: 'draft' | 'issue' | 'send' | undefined): DocPayload {
    const p: DocPayload = {
      customer_id: this.customerId,
      issue_date: this.issueDate,
      reference: this.reference.trim() || null,
      amounts_are: this.gstRegistered ? this.amountsAre : 'no_gst',
      discount_method: this.discountMethod,
      discount_value: this.discountOn ? (this.discountValue ?? 0) : 0,
      notes: this.notes.trim() || null,
      lines: this.lines.map(l => ({
        description: l.description.trim(), quantity: Number(l.quantity), rate: Number(l.rate),
        gst_rate: this.gstRegistered && this.amountsAre !== 'no_gst' ? l.gst_rate : 0
      })),
      action
    };
    if (this.isInvoice) {
      p.due_date = this.dueDate;
      p.terms = this.options.find(o => o.key === this.termKey)?.label ?? null;
      if (this.termKey === 'custom') p.terms = 'Due ' + this.dueDate;
    } else {
      p.expiry_date = this.dueDate;
      p.terms = this.terms.trim() || null;
    }
    return p;
  }

  save(action: 'draft' | 'issue' | 'send' | undefined): void {
    this.submitted = true; this.banner = '';
    if (!this.validate()) { this.banner = 'Please fix the highlighted fields.'; this.scrollToError(); return; }
    this.saving = true;
    const body = this.payload(action);
    const call = this.id ? this.api.update(this.kind, this.id, body) : this.api.create(this.kind, body);
    call.subscribe({
      next: r => {
        this.saving = false;
        this.alerts.toast(r.message);
        this.router.navigate(['/admin/sales', this.isInvoice ? 'invoices' : 'quotes', r.data.id]);
      },
      error: e => {
        this.saving = false;
        const p = toProblem(e);
        this.errors = p.fieldErrors;
        this.banner = p.message;
        if (!Object.keys(p.fieldErrors).length) this.alerts.DangerSwalnew('Could not save', p.message);
        else this.scrollToError();
      }
    });
  }

  cancel(): void {
    if (this.id) this.router.navigate(['/admin/sales', this.isInvoice ? 'invoices' : 'quotes', this.id]);
    else this.router.navigate(['/admin/sales', this.isInvoice ? 'invoices' : 'quotes']);
  }

  addCustomer(): void {
    this.router.navigate(['/admin/sales/customers/new'], { queryParams: { returnTo: this.router.url.split('?')[0] } });
  }

  private scrollToError(): void {
    setTimeout(() => (document.querySelector('.cy-input.invalid, [data-invalid="true"]') as HTMLElement | null)?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  }

  get selectedCustomer(): PickCustomer | undefined { return this.customers.find(c => c.id === this.customerId); }
  get today(): string { return iso(new Date()); }

  /** The edit page of the business being worked in, where GST registration is switched on. */
  get editBusiness(): any[] {
    try {
      const id = JSON.parse(localStorage.getItem('selected_company') || '{}')?.company_id;
      return id ? ['/admin/companies', id, 'edit'] : ['/admin/companies'];
    } catch { return ['/admin/companies']; }
  }
}

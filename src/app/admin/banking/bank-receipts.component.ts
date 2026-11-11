import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { toProblem } from '../sales/sales.service';
import { BankAccount, Receipt, ReceiptPage } from './banking.models';
import { BankingService } from './banking.service';

const ALLOWED = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'heic'];
const MAX_BYTES = 10 * 1024 * 1024;

/** Receipts: drop in photos or PDFs, add the details, open or delete them. */
@Component({
  selector: 'app-bank-receipts',
  templateUrl: './bank-receipts.component.html'
})
export class BankReceiptsComponent implements OnInit {
  data: ReceiptPage | null = null;
  accounts: BankAccount[] = [];
  search = '';
  page = 1;
  loading = true;
  error = '';

  dragging = false;
  uploading = false;
  uploadNotes: string[] = [];

  editing: Receipt | null = null;
  m = { description: '', date: '', amount: '', gst: '' , account_id: '' };
  saving = false;
  fieldErrors: Record<string, string> = {};
  formError = '';
  busyId: number | null = null;

  constructor(private api: BankingService, private alerts: AlertService) { }

  ngOnInit(): void {
    this.api.accounts().subscribe({ next: a => this.accounts = a, error: () => { } });
    this.load();
  }

  err(k: string): string { return this.fieldErrors[k] || ''; }
  get from(): number { return this.data && this.data.meta.total ? (this.data.meta.page - 1) * this.data.meta.per_page + 1 : 0; }
  get to(): number { return this.data ? Math.min(this.data.meta.page * this.data.meta.per_page, this.data.meta.total) : 0; }

  load(): void {
    this.loading = true; this.error = '';
    this.api.receipts(this.search.trim(), this.page).subscribe({
      next: d => { this.data = d; this.loading = false; },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }
  find(): void { this.page = 1; this.load(); }
  clear(): void { this.search = ''; this.find(); }
  go(p: number): void { this.page = p; this.load(); }

  // ---- upload ----
  onDrop(ev: DragEvent): void {
    ev.preventDefault(); this.dragging = false;
    this.upload(Array.from(ev.dataTransfer?.files || []));
  }
  onPick(input: HTMLInputElement): void {
    this.upload(Array.from(input.files || []));
    input.value = '';        // lets the same file be chosen again
  }

  private upload(files: File[]): void {
    if (!files.length || this.uploading) return;
    this.uploadNotes = [];
    const ok: File[] = [];
    for (const f of files) {
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      if (!ALLOWED.includes(ext)) this.uploadNotes.push(`${f.name}: only PDF, JPG, PNG, WEBP or HEIC files can be uploaded.`);
      else if (f.size > MAX_BYTES) this.uploadNotes.push(`${f.name}: this file is over 10 MB.`);
      else ok.push(f);
    }
    if (!ok.length) return;
    if (ok.length > 20) { this.uploadNotes.push('Upload up to 20 receipts at a time. The first 20 were sent.'); ok.length = 20; }
    this.uploading = true;
    this.api.uploadReceipts(ok).subscribe({
      next: r => { this.uploading = false; this.alerts.successSwalnew('Done', r.message); this.page = 1; this.load(); },
      error: e => {
        this.uploading = false;
        const pr = toProblem(e);
        const detail = Object.values(pr.fieldErrors);
        this.uploadNotes.push(...(detail.length ? detail : [pr.message]));
      }
    });
  }

  // ---- view / edit / delete ----
  view(r: Receipt): void {
    const tab = window.open('', '_blank');      // opened first so the browser does not block it
    this.busyId = r.id;
    this.api.receiptFile(r.id).subscribe({
      next: blob => {
        this.busyId = null;
        const url = URL.createObjectURL(blob);
        if (tab) tab.location.href = url; else window.location.href = url;
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      },
      error: e => { this.busyId = null; tab?.close(); this.alerts.DangerSwalnew('That did not work', toProblem(e).message); }
    });
  }

  edit(r: Receipt): void {
    this.editing = r;
    this.m = {
      description: r.description || '', date: r.date || '',
      amount: r.amount === null ? '' : String(r.amount), gst: r.gst === null ? '' : String(r.gst),
      account_id: r.account_id ? String(r.account_id) : ''
    };
    this.fieldErrors = {}; this.formError = '';
  }

  private num(v: string): number | null { const t = String(v).trim(); return t === '' ? null : Number(t); }

  save(): void {
    if (!this.editing) return;
    this.fieldErrors = {}; this.formError = '';
    const amount = this.num(this.m.amount), gst = this.num(this.m.gst);
    if (amount !== null && (isNaN(amount) || amount < 0)) { this.fieldErrors['amount'] = 'Enter the total as a number, for example 54.90.'; return; }
    if (gst !== null && (isNaN(gst) || gst < 0)) { this.fieldErrors['gst'] = 'Enter the GST as a number, for example 4.99.'; return; }
    if (amount !== null && gst !== null && gst > amount) { this.fieldErrors['gst'] = 'GST cannot be more than the total.'; return; }
    this.saving = true;
    this.api.updateReceipt(this.editing.id, {
      description: this.m.description.trim() || null, date: this.m.date || null, amount, gst,
      account_id: this.m.account_id ? Number(this.m.account_id) : null
    }).subscribe({
      next: r => { this.saving = false; this.editing = null; this.alerts.successSwalnew('Done', r.message); this.load(); },
      error: e => { this.saving = false; const pr = toProblem(e); this.fieldErrors = pr.fieldErrors; this.formError = pr.message; }
    });
  }

  async remove(r: Receipt): Promise<void> {
    if (!(await this.alerts.confirm('Delete this receipt?', `${r.file_name} is removed for good. This cannot be undone.`, 'Delete'))) return;
    this.busyId = r.id;
    this.api.deleteReceipt(r.id).subscribe({
      next: () => { this.busyId = null; if (this.data && this.data.data.length === 1 && this.page > 1) this.page--; this.load(); },
      error: e => { this.busyId = null; this.alerts.DangerSwalnew('That did not work', toProblem(e).message); }
    });
  }

  size(bytes: number): string {
    return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}

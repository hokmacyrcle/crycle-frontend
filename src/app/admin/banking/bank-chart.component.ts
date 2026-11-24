import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { toProblem } from '../sales/sales.service';
import { ChartAccount, ChartPayload, ChartType, ChartTypeInfo, GstCodeInfo } from './banking.models';
import { BankingService } from './banking.service';

interface Group { key: ChartType; label: string; rows: { a: ChartAccount; sub: boolean }[]; }

/** Chart of accounts: the list of accounts money is sorted into, grouped by type. */
@Component({
  selector: 'app-bank-chart',
  templateUrl: './bank-chart.component.html'
})
export class BankChartComponent implements OnInit {
  accounts: ChartAccount[] = [];
  types: ChartTypeInfo[] = [];
  gstCodes: GstCodeInfo[] = [];
  loading = true;
  error = '';

  showArchived = false;
  search = '';
  typeFilter: '' | ChartType = '';

  formOpen = false;
  editing: ChartAccount | null = null;
  m = { type: 'expense' as ChartType, detail: '', code: '', name: '', gst_code: 'gst', parent_id: '', description: '' };
  saving = false;
  fieldErrors: Record<string, string> = {};
  formError = '';
  busyId: number | null = null;

  constructor(private api: BankingService, private alerts: AlertService) { }

  ngOnInit(): void { this.load(); }

  err(k: string): string { return this.fieldErrors[k] || ''; }

  load(): void {
    this.loading = true; this.error = '';
    this.api.chart().subscribe({
      next: d => { this.accounts = d.data; this.types = d.types; this.gstCodes = d.gst_codes; this.loading = false; },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }

  // ---- list ----
  get counts(): { active: number; archived: number } {
    return { active: this.accounts.filter(a => a.active).length, archived: this.accounts.filter(a => !a.active).length };
  }

  /** Accounts in groups by type, sub-accounts right under their main account. */
  get groups(): Group[] {
    const q = this.search.trim().toLowerCase();
    const shown = this.accounts.filter(a => a.active === !this.showArchived
      && (!this.typeFilter || a.type === this.typeFilter)
      && (!q || a.name.toLowerCase().includes(q) || (a.code || '').toLowerCase().includes(q) || a.detail.toLowerCase().includes(q)));
    const ids = new Set(shown.map(a => a.id));
    return this.types.map(t => {
      const own = shown.filter(a => a.type === t.key);
      const mains = own.filter(a => !a.parent_id || !ids.has(a.parent_id));
      const rows: { a: ChartAccount; sub: boolean }[] = [];
      mains.forEach(m => {
        rows.push({ a: m, sub: false });
        own.filter(c => c.parent_id === m.id).forEach(c => rows.push({ a: c, sub: true }));
      });
      return { key: t.key, label: t.label, rows };
    }).filter(g => g.rows.length);
  }
  get hasFilter(): boolean { return !!(this.search.trim() || this.typeFilter); }
  clearFilters(): void { this.search = ''; this.typeFilter = ''; }

  // ---- form ----
  detailsFor(t: ChartType): string[] { return this.types.find(x => x.key === t)?.details || []; }
  /** The detail type most accounts of this type use, so people rarely need to change it. */
  private defaultDetail(t: ChartType): string { const l = this.detailsFor(t); return l.includes('Operating expense') ? 'Operating expense' : (l[0] || ''); }
  /** Main accounts of the same type that can be chosen as the parent. */
  get parents(): ChartAccount[] {
    return this.accounts.filter(a => a.active && a.type === this.m.type && !a.parent_id && (!this.editing || a.id !== this.editing.id));
  }
  get lockedType(): boolean { return !!this.editing && this.editing.locked; }
  get hasSubs(): boolean { return !!this.editing && this.accounts.some(a => a.parent_id === this.editing!.id); }

  openAdd(): void {
    this.editing = null; this.fieldErrors = {}; this.formError = '';
    this.m = { type: 'expense', detail: this.defaultDetail('expense'), code: '', name: '', gst_code: 'gst', parent_id: '', description: '' };
    this.formOpen = true;
  }
  openEdit(a: ChartAccount): void {
    this.editing = a; this.fieldErrors = {}; this.formError = '';
    this.m = { type: a.type, detail: a.detail, code: a.code || '', name: a.name, gst_code: a.gst_code, parent_id: a.parent_id ? String(a.parent_id) : '', description: a.description || '' };
    this.formOpen = true;
  }
  onType(): void {
    this.m.detail = this.defaultDetail(this.m.type);
    if (!this.editing) this.m.gst_code = this.m.type === 'income' || this.m.type === 'expense' ? 'gst' : 'none';
    this.m.parent_id = '';
  }

  save(): void {
    this.fieldErrors = {}; this.formError = '';
    if (!this.m.name.trim()) { this.fieldErrors['name'] = 'Give the account a name, for example Office supplies.'; return; }
    const p: ChartPayload = {
      code: this.m.code.trim() || null, name: this.m.name.trim(), type: this.m.type, detail: this.m.detail, gst_code: this.m.gst_code,
      description: this.m.description.trim() || null, parent_id: this.m.parent_id ? Number(this.m.parent_id) : null
    };
    this.saving = true;
    const call = this.editing ? this.api.updateChartAccount(this.editing.id, p) : this.api.addChartAccount(p);
    call.subscribe({
      next: r => { this.saving = false; this.formOpen = false; this.alerts.successSwalnew('Done', r.message); this.load(); },
      error: e => { this.saving = false; const pr = toProblem(e); this.fieldErrors = pr.fieldErrors; this.formError = pr.message; }
    });
  }

  // ---- archive / restore ----
  async archive(a: ChartAccount): Promise<void> {
    if (!(await this.alerts.confirm('Archive this account?', `${a.name} is hidden from the list and from new entries. Anything already recorded against it is kept. You can restore it any time.`, 'Archive'))) return;
    this.setArchived(a, true);
  }
  restore(a: ChartAccount): void { this.setArchived(a, false); }
  private setArchived(a: ChartAccount, archived: boolean): void {
    this.busyId = a.id;
    this.api.archiveChartAccount(a.id, archived).subscribe({
      next: () => { this.busyId = null; this.load(); },
      error: e => { this.busyId = null; this.alerts.DangerSwalnew('That did not work', toProblem(e).message); }
    });
  }
}

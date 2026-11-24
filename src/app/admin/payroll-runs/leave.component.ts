import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { toProblem } from '../sales/sales.service';
import { LeaveApiService, LeaveEmployee, LeaveLedgerRow, LeaveOverview, LeaveRequestRow, LeaveType } from './leave.service';

/** Leave: requests waiting for approval, each employee's balances, and the rules for how leave builds up. */
@Component({
  selector: 'app-leave',
  template: `
<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <p class="m-0 text-sm text-[#3C4663]">Record leave requests, approve them, and see each person's balance. Leave builds up automatically when you finalise a pay run.</p>
  <button type="button" class="cy-btn-primary shrink-0 self-start" (click)="openRequest()" *ngIf="!form"><app-icon name="plus" [size]="16"></app-icon>Request leave</button>
</div>

<div *ngIf="error" class="cy-card mt-4 flex flex-col gap-3">
  <div class="font-bold">We could not load leave</div><div class="text-sm text-[#3C4663]">{{ error }}</div>
  <button type="button" class="cy-btn-secondary self-start" (click)="load()">Try again</button>
</div>
<div *ngIf="loading && !o && !error" class="mt-4 text-sm text-[#5B6478]">Loading…</div>

<ng-container *ngIf="o">
  <form *ngIf="form as f" class="mt-4 flex flex-col gap-3 rounded-[20px] bg-white p-4" (ngSubmit)="saveRequest()" novalidate>
    <div class="text-base font-bold">Request leave</div>
    <div *ngIf="errs['form']" class="rounded-[12px] bg-[#FADBD8] px-3 py-2 text-sm font-bold text-[#9B1C1C]" role="alert">{{ errs['form'] }}</div>
    <div class="grid gap-3 sm:grid-cols-2">
      <label class="block"><span class="mb-1 block text-[13px] font-bold">Employee</span>
        <select class="cy-input" name="lemp" [(ngModel)]="f.employee_id" [class.cy-input-error]="errs['employee_id']">
          <option [ngValue]="null">Choose an employee</option><option *ngFor="let e of o.employees" [ngValue]="e.employee_id">{{ e.name }}</option></select>
        <span *ngIf="errs['employee_id']" class="mt-1 block text-[13px] font-bold text-[#9B1C1C]">{{ errs['employee_id'] }}</span></label>
      <label class="block"><span class="mb-1 block text-[13px] font-bold">Type of leave</span>
        <select class="cy-input" name="ltype" [(ngModel)]="f.leave_type_id" [class.cy-input-error]="errs['leave_type_id']">
          <option [ngValue]="null">Choose a type</option><option *ngFor="let t of o.types" [ngValue]="t.id">{{ t.name }}</option></select>
        <span *ngIf="errs['leave_type_id']" class="mt-1 block text-[13px] font-bold text-[#9B1C1C]">{{ errs['leave_type_id'] }}</span></label>
      <label class="block"><span class="mb-1 block text-[13px] font-bold">First day</span>
        <input type="date" class="cy-input" name="lstart" [(ngModel)]="f.start_date" [class.cy-input-error]="errs['start_date']">
        <span *ngIf="errs['start_date']" class="mt-1 block text-[13px] font-bold text-[#9B1C1C]">{{ errs['start_date'] }}</span></label>
      <label class="block"><span class="mb-1 block text-[13px] font-bold">Last day</span>
        <input type="date" class="cy-input" name="lend" [(ngModel)]="f.end_date" [class.cy-input-error]="errs['end_date']">
        <span *ngIf="errs['end_date']" class="mt-1 block text-[13px] font-bold text-[#9B1C1C]">{{ errs['end_date'] }}</span></label>
      <label class="block"><span class="mb-1 block text-[13px] font-bold">Total hours <span class="font-normal text-[#5B6478]">(optional)</span></span>
        <input type="number" inputmode="decimal" min="0" step="0.25" class="cy-input" name="lhours" [(ngModel)]="f.hours" [class.cy-input-error]="errs['hours']">
        <span class="mt-1 block text-[12px] text-[#5B6478]">Leave empty to use their usual working days and hours.</span>
        <span *ngIf="errs['hours']" class="mt-1 block text-[13px] font-bold text-[#9B1C1C]">{{ errs['hours'] }}</span></label>
      <label class="block"><span class="mb-1 block text-[13px] font-bold">Note <span class="font-normal text-[#5B6478]">(optional)</span></span>
        <input type="text" class="cy-input" name="lnote" maxlength="200" [(ngModel)]="f.note"></label>
    </div>
    <div class="flex gap-2"><button type="submit" class="cy-btn-primary" [disabled]="busy">Save request</button><button type="button" class="cy-btn-secondary" (click)="form = null">Cancel</button></div>
  </form>

  <section class="mt-5" aria-labelledby="lv-req">
    <div id="lv-req" class="text-base font-bold" role="heading" aria-level="2">Requests</div>
    <div *ngIf="!requests.length" class="mt-2 rounded-[20px] border-2 border-dashed border-[#B9B39F] p-5 text-sm text-[#3C4663]">No leave requests yet. Choose Request leave to add one.</div>
    <ul class="m-0 mt-2 flex list-none flex-col gap-3 p-0">
      <li *ngFor="let r of requests" class="rounded-[20px] bg-white p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="truncate text-[15px] font-bold">{{ r.employee_name }}</div>
            <div class="text-[13px] text-[#5B6478]">{{ r.type }} · {{ r.start_date | auDate }}<span *ngIf="r.end_date !== r.start_date"> – {{ r.end_date | auDate }}</span> · {{ r.hours }} hours</div>
            <div *ngIf="r.note" class="mt-1 text-[13px] text-[#3C4663]">{{ r.note }}</div>
          </div>
          <span class="cy-pill shrink-0" [ngClass]="r.status === 'approved' ? 'cy-pill-paid' : r.status === 'declined' ? 'cy-pill-declined' : 'cy-pill-awaiting'">{{ r.status === 'pending' ? 'Waiting' : r.status === 'approved' ? 'Approved' : 'Declined' }}</span>
        </div>
        <div *ngIf="r.to_pay" class="mt-2 rounded-[12px] bg-[#F6F4EC] px-3 py-2 text-[13px] text-[#3C4663]">Hourly employee: add this leave to a pay run so it is paid.</div>
        <div *ngIf="rowError[r.id]" class="mt-2 text-[13px] font-bold text-[#9B1C1C]" role="alert">{{ rowError[r.id] }}</div>
        <div class="mt-3 flex flex-wrap gap-2">
          <ng-container *ngIf="r.status === 'pending'">
            <button type="button" class="cy-btn-primary cy-btn-sm" (click)="approve(r)" [disabled]="busyId === r.id">Approve</button>
            <button type="button" class="cy-btn-secondary cy-btn-sm" (click)="decline(r)" [disabled]="busyId === r.id">Decline</button>
          </ng-container>
          <button type="button" class="cy-btn-secondary cy-btn-sm" (click)="remove(r)" [disabled]="busyId === r.id">Remove</button>
        </div>
      </li>
    </ul>
  </section>

  <section class="mt-6" aria-labelledby="lv-bal">
    <div id="lv-bal" class="text-base font-bold" role="heading" aria-level="2">Balances</div>
    <div *ngIf="!o.employees.length" class="mt-2 rounded-[20px] border-2 border-dashed border-[#B9B39F] p-5 text-sm text-[#3C4663]">Add an employee to start tracking leave.</div>
    <ul class="m-0 mt-2 flex list-none flex-col gap-3 p-0">
      <li *ngFor="let e of o.employees" class="rounded-[20px] bg-white p-4">
        <div class="flex items-center justify-between gap-3">
          <div class="truncate text-[15px] font-bold">{{ e.name }}</div>
          <span *ngIf="e.casual" class="cy-pill cy-pill-draft shrink-0">Casual</span>
        </div>
        <div *ngIf="e.casual" class="mt-1 text-[13px] text-[#5B6478]">Casual employees do not build up paid leave.</div>
        <dl *ngIf="!e.casual" class="m-0 mt-2 grid grid-cols-2 gap-3">
          <div *ngFor="let t of paidTypes()"><dt class="text-[12px] font-bold uppercase text-[#5B6478]">{{ t.name }}</dt>
            <dd class="m-0 text-[18px] font-extrabold" [class.text-[#9B1C1C]]="bal(e, t) < 0">{{ bal(e, t) }} <span class="text-[13px] font-normal text-[#5B6478]">hours</span></dd></div>
        </dl>
        <div class="mt-3 flex flex-wrap gap-2" *ngIf="!e.casual">
          <button type="button" class="cy-btn-secondary cy-btn-sm" (click)="openAdjust(e)">Adjust balance</button>
          <button type="button" class="cy-btn-secondary cy-btn-sm" (click)="toggleHistory(e)">{{ history[e.employee_id] ? 'Hide history' : 'History' }}</button>
        </div>
        <form *ngIf="adjust[e.employee_id] as a" class="mt-3 flex flex-col gap-3 rounded-[16px] border-[1.5px] border-[#B9B39F] p-3" (ngSubmit)="saveAdjust(e)" novalidate>
          <div *ngIf="adjErr[e.employee_id]['form']" class="rounded-[12px] bg-[#FADBD8] px-3 py-2 text-sm font-bold text-[#9B1C1C]" role="alert">{{ adjErr[e.employee_id]['form'] }}</div>
          <div class="grid gap-3 sm:grid-cols-3">
            <label class="block"><span class="mb-1 block text-[13px] font-bold">Leave type</span>
              <select class="cy-input" [name]="'at' + e.employee_id" [(ngModel)]="a.leave_type_id"><option *ngFor="let t of paidTypes()" [ngValue]="t.id">{{ t.name }}</option></select></label>
            <label class="block"><span class="mb-1 block text-[13px] font-bold">Hours to add</span>
              <input type="number" inputmode="decimal" step="0.25" class="cy-input" aria-label="Hours to add" [name]="'ah' + e.employee_id" [(ngModel)]="a.hours" [class.cy-input-error]="adjErr[e.employee_id]['hours']">
              <span class="mt-1 block text-[12px] text-[#5B6478]">Use a minus number to take hours off.</span>
              <span *ngIf="adjErr[e.employee_id]['hours']" class="mt-1 block text-[13px] font-bold text-[#9B1C1C]">{{ adjErr[e.employee_id]['hours'] }}</span></label>
            <label class="block"><span class="mb-1 block text-[13px] font-bold">Reason</span>
              <input type="text" class="cy-input" maxlength="120" aria-label="Reason" [name]="'an' + e.employee_id" [(ngModel)]="a.note" placeholder="e.g. Opening balance" [class.cy-input-error]="adjErr[e.employee_id]['note']">
              <span *ngIf="adjErr[e.employee_id]['note']" class="mt-1 block text-[13px] font-bold text-[#9B1C1C]">{{ adjErr[e.employee_id]['note'] }}</span></label>
          </div>
          <div class="flex gap-2"><button type="submit" class="cy-btn-primary cy-btn-sm" [disabled]="busy">Save</button><button type="button" class="cy-btn-secondary cy-btn-sm" (click)="closeAdjust(e)">Cancel</button></div>
        </form>
        <ul *ngIf="history[e.employee_id] as rows" class="m-0 mt-3 list-none rounded-[12px] bg-[#F6F4EC] p-0 text-sm">
          <li *ngIf="!rows.length" class="px-3 py-2 text-[#5B6478]">No changes yet.</li>
          <li *ngFor="let h of rows" class="flex items-start justify-between gap-3 border-b border-white px-3 py-2 last:border-b-0">
            <span class="min-w-0"><span class="block font-bold">{{ h.type }}</span><span class="text-[12px] text-[#5B6478]">{{ h.date | auDate }} · {{ h.note || kindName(h.kind) }}</span></span>
            <span class="shrink-0 font-bold" [class.text-[#9B1C1C]]="h.hours < 0">{{ h.hours > 0 ? '+' : '' }}{{ h.hours }}</span>
          </li>
        </ul>
      </li>
    </ul>
  </section>

  <section class="mt-6" aria-labelledby="lv-rules">
    <div id="lv-rules" class="text-base font-bold" role="heading" aria-level="2">How leave builds up</div>
    <p class="m-0 mt-1 text-[13px] text-[#5B6478]">Set by the National Employment Standards: 4 weeks of annual leave and 10 days of personal/carer's leave a year for full-time staff. Change these only if your awards or agreements say otherwise.</p>
    <ul class="m-0 mt-2 flex list-none flex-col gap-3 p-0">
      <li *ngFor="let t of paidTypes()" class="rounded-[20px] bg-white p-4">
        <div class="text-[15px] font-bold">{{ t.name }}</div>
        <div class="mt-2 flex flex-wrap items-end gap-3">
          <label class="block"><span class="mb-1 block text-[13px] font-bold">1 hour of leave for every … hours worked</span>
            <input type="number" inputmode="decimal" min="1" step="0.5" class="cy-input max-w-[160px]" [name]="'rule' + t.id" [(ngModel)]="rules[t.id]" [class.cy-input-error]="ruleErr[t.id]"></label>
          <button type="button" class="cy-btn-secondary cy-btn-sm" (click)="saveRule(t)" [disabled]="busy">Save</button>
        </div>
        <div *ngIf="ruleErr[t.id]" class="mt-1 text-[13px] font-bold text-[#9B1C1C]" role="alert">{{ ruleErr[t.id] }}</div>
        <div class="mt-1 text-[12px] text-[#5B6478]">Leave empty if this leave does not build up. Casual employees never build up paid leave.</div>
      </li>
    </ul>
  </section>
</ng-container>`
})
export class LeaveComponent implements OnInit {
  o: LeaveOverview | null = null;
  requests: LeaveRequestRow[] = [];
  loading = true; error = ''; busy = false; busyId: number | null = null;
  form: { employee_id: number | null; leave_type_id: number | null; start_date: string; end_date: string; hours: number | string | null; note: string } | null = null;
  errs: Record<string, string> = {};
  rowError: Record<number, string> = {};
  adjust: Record<number, { leave_type_id: number | null; hours: number | string | null; note: string } | undefined> = {};
  adjErr: Record<number, Record<string, string>> = {};
  history: Record<number, LeaveLedgerRow[] | undefined> = {};
  rules: Record<number, number | string | null> = {};
  ruleErr: Record<number, string> = {};

  constructor(private api: LeaveApiService, private alerts: AlertService) { }
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = '';
    this.api.overview().subscribe({
      next: o => { this.setOverview(o); this.api.requests().subscribe({ next: r => { this.requests = r; this.loading = false; }, error: e => { this.loading = false; this.error = toProblem(e).message; } }); },
      error: e => { this.loading = false; this.error = toProblem(e).message; }
    });
  }

  private setOverview(o: LeaveOverview): void {
    this.o = o; this.rules = {};
    o.types.forEach(t => { this.rules[t.id] = t.accrual_hours; });
  }
  private reloadRequests(): void { this.api.requests().subscribe(r => this.requests = r); }

  paidTypes(): LeaveType[] { return (this.o?.types ?? []).filter(t => t.paid); }
  bal(e: LeaveEmployee, t: LeaveType): number { return e.balances[String(t.id)] ?? 0; }
  kindName(k: string): string { return k === 'accrual' ? 'Built up' : k === 'taken' ? 'Leave taken' : 'Adjustment'; }

  // ---- requests
  openRequest(): void { this.errs = {}; this.form = { employee_id: null, leave_type_id: null, start_date: '', end_date: '', hours: null, note: '' }; }

  saveRequest(): void {
    const f = this.form; if (!f) return;
    const e: Record<string, string> = {};
    if (!f.employee_id) e['employee_id'] = 'Choose an employee.';
    if (!f.leave_type_id) e['leave_type_id'] = 'Choose the type of leave.';
    if (!f.start_date) e['start_date'] = 'Enter the first day.';
    if (!f.end_date) e['end_date'] = 'Enter the last day.';
    else if (f.start_date && f.end_date < f.start_date) e['end_date'] = 'The last day cannot be before the first day.';
    const hrs = f.hours === null || f.hours === '' ? null : Number(f.hours);
    if (hrs !== null && !(hrs > 0)) e['hours'] = 'Hours must be more than 0.';
    this.errs = e;
    if (Object.keys(e).length) return;
    this.busy = true;
    this.api.createRequest({ employee_id: f.employee_id!, leave_type_id: f.leave_type_id!, start_date: f.start_date, end_date: f.end_date, hours: hrs, note: f.note.trim() || null }).subscribe({
      next: () => { this.busy = false; this.form = null; this.reloadRequests(); this.alerts.toast('Leave request saved'); this.refreshCounts(); },
      error: err => { this.busy = false; const p = toProblem(err); this.errs = Object.keys(p.fieldErrors).length ? p.fieldErrors : { form: p.message }; }
    });
  }

  private refreshCounts(): void { this.api.overview().subscribe(o => this.setOverview(o)); }

  async approve(r: LeaveRequestRow, allowNegative = false): Promise<void> {
    this.rowError[r.id] = ''; this.busyId = r.id;
    this.api.approve(r.id, allowNegative).subscribe({
      next: () => { this.busyId = null; this.reloadRequests(); this.refreshCounts(); this.alerts.toast('Leave approved'); },
      error: async err => {
        this.busyId = null; const p = toProblem(err);
        if (p.fieldErrors['balance']) {
          if (await this.alerts.confirm('Approve anyway?', p.message + ' Approving will make the balance negative.', 'Approve anyway')) this.approve(r, true);
        } else this.rowError[r.id] = p.message;
      }
    });
  }

  decline(r: LeaveRequestRow): void {
    this.rowError[r.id] = ''; this.busyId = r.id;
    this.api.decline(r.id).subscribe({
      next: () => { this.busyId = null; this.reloadRequests(); this.refreshCounts(); },
      error: err => { this.busyId = null; this.rowError[r.id] = toProblem(err).message; }
    });
  }

  async remove(r: LeaveRequestRow): Promise<void> {
    const ok = await this.alerts.confirm('Remove this leave?', r.status === 'approved' ? 'Approved paid leave goes back onto the balance.' : 'It will be deleted.', 'Remove');
    if (!ok) return;
    this.rowError[r.id] = ''; this.busyId = r.id;
    this.api.remove(r.id).subscribe({
      next: () => { this.busyId = null; this.reloadRequests(); this.refreshCounts(); delete this.history[r.employee_id]; },
      error: err => { this.busyId = null; this.rowError[r.id] = toProblem(err).message; }
    });
  }

  // ---- balances
  openAdjust(e: LeaveEmployee): void { this.adjErr[e.employee_id] = {}; this.adjust[e.employee_id] = { leave_type_id: this.paidTypes()[0]?.id ?? null, hours: null, note: '' }; }
  closeAdjust(e: LeaveEmployee): void { delete this.adjust[e.employee_id]; delete this.adjErr[e.employee_id]; }

  saveAdjust(e: LeaveEmployee): void {
    const a = this.adjust[e.employee_id]; if (!a) return;
    const err: Record<string, string> = {};
    const h = a.hours === null || a.hours === '' ? NaN : Number(a.hours);
    if (!h) err['hours'] = 'Enter the hours to add, or a minus number to take off.';
    if (!a.note.trim()) err['note'] = 'Say why, for example "Opening balance".';
    this.adjErr[e.employee_id] = err;
    if (Object.keys(err).length) return;
    this.busy = true;
    this.api.adjust({ employee_id: e.employee_id, leave_type_id: a.leave_type_id!, hours: h, note: a.note.trim() }).subscribe({
      next: o => { this.busy = false; this.setOverview(o); this.closeAdjust(e); delete this.history[e.employee_id]; this.alerts.toast('Balance updated'); },
      error: x => { this.busy = false; const p = toProblem(x); this.adjErr[e.employee_id] = Object.keys(p.fieldErrors).length ? p.fieldErrors : { form: p.message }; }
    });
  }

  toggleHistory(e: LeaveEmployee): void {
    if (this.history[e.employee_id]) { delete this.history[e.employee_id]; return; }
    this.api.ledger(e.employee_id).subscribe({ next: rows => this.history[e.employee_id] = rows, error: x => this.alerts.DangerSwalnew('That did not work', toProblem(x).message) });
  }

  // ---- rules
  saveRule(t: LeaveType): void {
    const v = this.rules[t.id]; const n = v === null || v === '' ? null : Number(v);
    if (n !== null && (isNaN(n) || n < 1)) { this.ruleErr[t.id] = 'Enter at least 1 hour, or leave it empty if this leave does not build up.'; return; }
    this.ruleErr[t.id] = ''; this.busy = true;
    this.api.saveType(t.id, n).subscribe({
      next: o => { this.busy = false; this.setOverview(o); this.alerts.toast('Saved'); },
      error: err => { this.busy = false; const p = toProblem(err); this.ruleErr[t.id] = p.fieldErrors['accrual_hours'] || p.message; }
    });
  }
}

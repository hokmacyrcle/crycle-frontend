import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { toProblem } from '../sales/sales.service';
import { Frequency } from './payrun.models';
import { PayRunService } from './payrun.service';

@Component({
  selector: 'app-payroll-settings',
  template: `
<p class="m-0 text-sm text-[#3C4663]">Defaults for this business. They apply to new employees and new pay runs.</p>

<div *ngIf="loading" class="mt-4 text-sm text-[#5B6478]">Loading…</div>
<div *ngIf="loadError" class="cy-card mt-4 flex flex-col gap-2"><div class="font-bold">We could not load your settings</div><div class="text-sm text-[#3C4663]">{{ loadError }}</div></div>

<form *ngIf="!loading && !loadError" class="cy-card mt-4 flex flex-col gap-5" (ngSubmit)="save()" novalidate>
  <div *ngIf="banner" class="rounded-[12px] bg-[#FADBD8] px-4 py-3 text-sm font-bold text-[#9B1C1C]" role="alert">{{ banner }}</div>

  <label class="block sm:max-w-xs"><span class="mb-1 block text-sm font-bold">Super rate (%)</span>
    <input type="number" inputmode="decimal" step="0.01" [min]="min" name="rate" class="cy-input" [(ngModel)]="rate" [class.cy-input-error]="errors['super_rate']">
    <span class="mt-1 block text-[13px] text-[#5B6478]">Paid on top of ordinary pay. The legal minimum is {{ min }}%. Only raise it if your staff are owed more, for example under an award.</span>
    <span *ngIf="errors['super_rate']" class="mt-1 block text-[13px] font-bold text-[#9B1C1C]">{{ errors['super_rate'] }}</span></label>

  <label class="block sm:max-w-xs"><span class="mb-1 block text-sm font-bold">Usual pay frequency</span>
    <select name="freq" class="cy-input" [(ngModel)]="frequency"><option *ngFor="let f of freqs" [value]="f">{{ f }}</option></select>
    <span class="mt-1 block text-[13px] text-[#5B6478]">Pre-filled when you add an employee. Each employee can still be paid weekly, fortnightly or monthly.</span>
    <span *ngIf="errors['default_pay_frequency']" class="mt-1 block text-[13px] font-bold text-[#9B1C1C]">{{ errors['default_pay_frequency'] }}</span></label>

  <label class="block sm:max-w-xs"><span class="mb-1 block text-sm font-bold">Usual hours per week</span>
    <input type="number" inputmode="decimal" step="0.25" min="0" name="hours" class="cy-input" [(ngModel)]="hours" [class.cy-input-error]="errors['default_hours_per_week']">
    <span class="mt-1 block text-[13px] text-[#5B6478]">Pre-filled for hourly employees. Pay runs start from each employee's own hours.</span>
    <span *ngIf="errors['default_hours_per_week']" class="mt-1 block text-[13px] font-bold text-[#9B1C1C]">{{ errors['default_hours_per_week'] }}</span></label>

  <div><button type="submit" class="cy-btn-primary" [disabled]="busy">{{ busy ? 'Saving…' : 'Save settings' }}</button></div>
  <p class="m-0 text-[12px] leading-snug text-[#5B6478]">A pay run keeps the super rate it was created with. Changing it here does not change runs you already made.</p>
</form>`
})
export class PayrollSettingsComponent implements OnInit {
  freqs: Frequency[] = ['Weekly', 'Fortnightly', 'Monthly'];
  rate: number | null = 12;
  frequency: Frequency = 'Fortnightly';
  hours: number | null = 38;
  min = 12;
  loading = true; loadError = ''; busy = false; banner = '';
  errors: Record<string, string> = {};

  constructor(private api: PayRunService, private alerts: AlertService) { }

  ngOnInit(): void {
    this.api.settings().subscribe({
      next: s => { this.rate = s.super_rate; this.frequency = s.default_pay_frequency; this.hours = s.default_hours_per_week; this.min = s.min_super_rate; this.loading = false; },
      error: e => { this.loading = false; this.loadError = toProblem(e).message; }
    });
  }

  save(): void {
    this.errors = {}; this.banner = '';
    const empty = (v: unknown) => v === null || v === '' || v === undefined;
    if (empty(this.rate)) this.errors['super_rate'] = 'Enter the super rate.';
    else if (Number(this.rate) < this.min) this.errors['super_rate'] = 'The super rate cannot be lower than the ' + this.min + '% super guarantee.';
    if (empty(this.hours) || Number(this.hours) <= 0) this.errors['default_hours_per_week'] = 'Enter hours greater than 0.';
    if (Object.keys(this.errors).length) return;
    this.busy = true;
    this.api.saveSettings({ super_rate: Number(this.rate), default_pay_frequency: this.frequency, default_hours_per_week: Number(this.hours) }).subscribe({
      next: s => { this.busy = false; this.rate = s.super_rate; this.hours = s.default_hours_per_week; this.alerts.toast('Settings saved'); },
      error: e => { this.busy = false; const p = toProblem(e); this.errors = p.fieldErrors; this.banner = Object.keys(p.fieldErrors).length ? '' : p.message; }
    });
  }
}

import { Component } from '@angular/core';
import { toProblem } from '../sales/sales.service';
import { CalcBasis, CalcResult, CalcSituation, Frequency } from './payrun.models';
import { PayRunService } from './payrun.service';

/** "What would this pay be?" Nothing is saved. Uses the same maths as a pay run. */
@Component({
  selector: 'app-pay-calculator',
  template: `
<p class="m-0 text-sm text-[#3C4663]">Work out tax, super and take-home pay for any amount. Nothing is saved.</p>

<form class="cy-card mt-4 flex flex-col gap-5" (ngSubmit)="calculate()" novalidate>
  <div *ngIf="banner" class="rounded-[12px] bg-[#FADBD8] px-4 py-3 text-sm font-bold text-[#9B1C1C]" role="alert">{{ banner }}</div>

  <fieldset class="m-0 border-0 p-0">
    <legend class="mb-2 text-sm font-bold">What are you entering?</legend>
    <div class="grid grid-cols-3 gap-2">
      <label *ngFor="let b of bases" class="flex min-h-[48px] cursor-pointer items-center justify-center rounded-[14px] border-[1.5px] px-2 text-center text-sm font-bold"
             [ngClass]="basis === b.value ? 'border-cyrcle-navy bg-cyrcle-navy text-white' : 'border-[#B9B39F] bg-white'">
        <input type="radio" name="basis" class="sr-only" [value]="b.value" [(ngModel)]="basis" (ngModelChange)="result = null">{{ b.label }}
      </label>
    </div>
  </fieldset>

  <div class="grid gap-4 sm:grid-cols-2">
    <label class="block"><span class="mb-1 block text-sm font-bold">{{ amountLabel }}</span>
      <input type="number" inputmode="decimal" min="0" step="0.01" name="amount" class="cy-input" [(ngModel)]="amount" [class.cy-input-error]="errors['amount']" placeholder="0.00">
      <span *ngIf="errors['amount']" class="mt-1 block text-[13px] font-bold text-[#9B1C1C]">{{ errors['amount'] }}</span></label>
    <label *ngIf="basis === 'hourly'" class="block"><span class="mb-1 block text-sm font-bold">Hours worked in the period</span>
      <input type="number" inputmode="decimal" min="0" step="0.25" name="hours" class="cy-input" [(ngModel)]="hours" [class.cy-input-error]="errors['hours']" placeholder="0">
      <span *ngIf="errors['hours']" class="mt-1 block text-[13px] font-bold text-[#9B1C1C]">{{ errors['hours'] }}</span></label>
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    <label class="block"><span class="mb-1 block text-sm font-bold">Paid</span>
      <select name="freq" class="cy-input" [(ngModel)]="frequency"><option *ngFor="let f of freqs" [value]="f">{{ f }}</option></select></label>
    <label class="block"><span class="mb-1 block text-sm font-bold">Tax situation</span>
      <select name="sit" class="cy-input" [(ngModel)]="situation"><option *ngFor="let s of situations" [value]="s.value">{{ s.label }}</option></select></label>
  </div>

  <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="loan" [(ngModel)]="studyLoan">Has a study and training loan (HELP, VSL, SSL or TSL)</label>

  <button type="submit" class="cy-btn-primary self-start" [disabled]="busy">{{ busy ? 'Calculating…' : 'Calculate' }}</button>
</form>

<section *ngIf="result" class="cy-card mt-4" aria-live="polite" aria-label="Result">
  <dl class="m-0 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
    <div class="rounded-[16px] bg-[#F6F4EC] px-4 py-3"><dt class="text-[12px] font-bold uppercase tracking-wide text-[#5B6478]">Gross pay</dt><dd class="m-0 mt-0.5 text-[18px] font-extrabold">{{ result.gross | aud }}</dd></div>
    <div class="rounded-[16px] bg-[#F6F4EC] px-4 py-3"><dt class="text-[12px] font-bold uppercase tracking-wide text-[#5B6478]">Tax withheld</dt><dd class="m-0 mt-0.5 text-[18px] font-extrabold">{{ result.tax | aud }}</dd><dd *ngIf="result.study_loan > 0" class="m-0 text-[12px] text-[#5B6478]">includes {{ result.study_loan | aud }} study loan</dd></div>
    <div class="rounded-[16px] bg-[#F6F4EC] px-4 py-3"><dt class="text-[12px] font-bold uppercase tracking-wide text-[#5B6478]">Super ({{ result.super_rate }}%)</dt><dd class="m-0 mt-0.5 text-[18px] font-extrabold">{{ result.super | aud }}</dd></div>
    <div class="rounded-[16px] bg-cyrcle-navy px-4 py-3 text-white"><dt class="text-[12px] font-bold uppercase tracking-wide opacity-80">Take-home</dt><dd class="m-0 mt-0.5 text-[18px] font-extrabold">{{ result.net | aud }}</dd></div>
  </dl>
  <p class="mb-0 mt-3 text-[13px] leading-snug text-[#3C4663]">{{ result.frequency }} pay · {{ result.situation_label }}. Super is paid on top of gross pay.</p>
</section>

<p class="mt-4 text-[12px] leading-snug text-[#5B6478]">Calculated with the ATO's tax withholding formulas for 2026–27, including the Medicare levy. Study and training loan repayments are included when you tick the box. It does not include allowances, bonuses or leave, and foreign residents with a tax file number or working holiday makers need separate rates. It is an estimate for planning, and pay runs use the same figures.</p>`
})
export class PayCalculatorComponent {
  bases: { value: CalcBasis; label: string }[] = [
    { value: 'gross', label: 'Pay for the period' }, { value: 'salary', label: 'Yearly salary' }, { value: 'hourly', label: 'Hourly rate' }];
  freqs: Frequency[] = ['Weekly', 'Fortnightly', 'Monthly'];
  situations: { value: CalcSituation; label: string }[] = [
    { value: 'threshold', label: 'Resident, tax-free threshold claimed' },
    { value: 'no_threshold', label: 'Resident, threshold not claimed' },
    { value: 'no_tfn_resident', label: 'No tax file number (resident)' },
    { value: 'no_tfn_foreign', label: 'No tax file number (foreign resident)' }];

  basis: CalcBasis = 'gross';
  frequency: Frequency = 'Fortnightly';
  situation: CalcSituation = 'threshold';
  studyLoan = false;
  amount: number | null = null;
  hours: number | null = null;
  errors: Record<string, string> = {};
  banner = '';
  busy = false;
  result: CalcResult | null = null;

  constructor(private api: PayRunService) { }

  get amountLabel(): string {
    return this.basis === 'salary' ? 'Yearly salary ($)' : this.basis === 'hourly' ? 'Hourly rate ($)' : 'Gross pay for one pay period ($)';
  }

  calculate(): void {
    this.errors = {}; this.banner = ''; this.result = null;
    if (this.amount === null || (this.amount as unknown) === '') this.errors['amount'] = 'Enter an amount.';
    if (this.basis === 'hourly' && (this.hours === null || (this.hours as unknown) === '')) this.errors['hours'] = 'Enter the hours worked.';
    if (Object.keys(this.errors).length) return;
    this.busy = true;
    this.api.calculate({ basis: this.basis, frequency: this.frequency, situation: this.situation, amount: Number(this.amount), hours: this.basis === 'hourly' ? Number(this.hours) : null, study_loan: this.studyLoan }).subscribe({
      next: r => { this.busy = false; this.result = r; },
      error: e => { this.busy = false; const p = toProblem(e); this.errors = p.fieldErrors; this.banner = Object.keys(p.fieldErrors).length ? '' : p.message; }
    });
  }
}

export type Frequency = 'Weekly' | 'Fortnightly' | 'Monthly';

export interface PayRunRow {
  id: number;
  reference: string;
  frequency: Frequency;
  period_start: string;
  period_end: string;
  pay_date: string;
  status: 'draft' | 'finalised';
  employees: number;
  total_gross: number;
  total_tax: number;
  total_super: number;
  total_net: number;
}

export interface PayRunLine {
  id: number;
  employee_id: number;
  employee_name: string;
  pay_basis: 'hourly' | 'salary';
  hourly_rate: number | null;
  annual_salary: number | null;
  hours: number | null;
  gross: number;
  tax: number;
  super_amount: number;
  net: number;
  tax_method: string;
  tax_status: 'auto' | 'review' | 'manual_required';
  tax_note: string | null;
  tax_overridden: boolean;
  tax_confirmed: boolean;
  super_fund_name: string | null;
  super_member_number: string | null;
}

export interface PayRunFull extends PayRunRow {
  super_due_date: string | null;
  finalised_at: string | null;
  employer: { name: string; abn: string | null; gst_registered: boolean; address: string[] };
  needs_attention: number;
  can: { edit: boolean; finalise: boolean; delete: boolean };
  lines: PayRunLine[];
}

export interface NewPayRun { frequency: Frequency; period_start: string; period_end: string; pay_date: string; }
export interface LineChange { hours?: number | null; tax_override?: number; clear_tax_override?: boolean; confirm_tax?: boolean; }

export type CalcBasis = 'gross' | 'salary' | 'hourly';
export type CalcSituation = 'threshold' | 'no_threshold' | 'no_tfn_resident' | 'no_tfn_foreign';
export interface CalcInput { basis: CalcBasis; frequency: Frequency; situation: CalcSituation; amount: number; hours?: number | null; }
export interface CalcResult { gross: number; tax: number; super: number; net: number; situation_label: string; frequency: Frequency; basis: CalcBasis; }

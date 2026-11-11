export type ItemKind = 'allowance' | 'bonus' | 'overtime' | 'leave' | 'reimbursement' | 'deduction';
export interface LineItem { id: number; kind: ItemKind; label: string; hours: number | null; rate: number | null; amount: number; counts_for_super: boolean; payee: string | null; }
export interface NewItem { kind: ItemKind; label: string; amount?: number | null; hours?: number | null; rate?: number | null; counts_for_super?: boolean; payee?: string; }

export interface StpIssue { level: 'blocking' | 'warning'; text: string; }
export interface StpCheck {
  ready: boolean; blocking: number; run_issues: StpIssue[];
  employees: { line_id: number; employee_id: number; employee_name: string; employment_basis: string | null; employment_basis_name: string | null; tax_treatment_code: string | null; issues: StpIssue[] }[];
}

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
  base_pay: number;
  reimbursements: number;
  deductions: number;
  items: LineItem[];
  leave_available: { id: number; type: string; start_date: string; end_date: string; hours: number; amount: number }[];
  hours_source: 'timesheet' | 'estimated' | 'manual' | null;
  hours_confirmed: boolean;
  gross: number;
  tax: number;
  study_loan: number;
  super_amount: number;
  net: number;
  tax_method: string;
  tax_status: 'auto' | 'review' | 'manual_required';
  tax_note: string | null;
  tax_overridden: boolean;
  tax_confirmed: boolean;
  super_fund_name: string | null;
  super_member_number: string | null;
  ytd: Totals | null;
  entitlements: { type: string; accrued: number; balance: number }[];
  leave_taken: { type: string; start_date: string; end_date: string; hours: number }[];
}

export interface Totals {
  gross: number; tax: number; super: number; net: number; base_pay: number; study_loan: number;
  items: Record<ItemKind, number>;
}

export interface PayRunFull extends PayRunRow {
  super_due_date: string | null;
  super_paid_at: string | null;
  finalised_at: string | null;
  super_rate: number;
  employer: { name: string; abn: string | null; gst_registered: boolean; address: string[] };
  needs_attention: number;
  can: { edit: boolean; finalise: boolean; delete: boolean };
  lines: PayRunLine[];
}

export interface NewPayRun { frequency: Frequency; period_start: string; period_end: string; pay_date: string; }
export interface LineChange { confirm_hours?: boolean; hours?: number | null; tax_override?: number; clear_tax_override?: boolean; confirm_tax?: boolean; }

export type CalcBasis = 'gross' | 'salary' | 'hourly';
export type CalcSituation = 'threshold' | 'no_threshold' | 'no_tfn_resident' | 'no_tfn_foreign';
export interface CalcInput { basis: CalcBasis; frequency: Frequency; situation: CalcSituation; amount: number; hours?: number | null; study_loan?: boolean; }
export interface CalcResult { super_rate: number; gross: number; tax: number; study_loan: number; super: number; net: number; situation_label: string; frequency: Frequency; basis: CalcBasis; }

export interface PayrollSettings { super_rate: number; default_pay_frequency: Frequency; default_hours_per_week: number; min_super_rate: number; }
export interface HistorySlip { run_id: number; line_id: number; reference: string; period_start: string; period_end: string; pay_date: string; gross: number; tax: number; net: number; }
export interface HistoryEmployee extends Totals { employee_id: number; name: string; payslips: HistorySlip[]; }
export interface History { fy: number; label: string; from: string; to: string; years: number[]; totals: Totals & { payslips: number }; employees: HistoryEmployee[]; }

export interface OverviewAttention { employee_id: number; name: string; issues: string[]; }
export interface OverviewDraft { id: number; reference: string; frequency: Frequency; period_start: string; period_end: string; pay_date: string; needs_attention: number; }
export interface OverviewNext { frequency: Frequency; employees: number; has_draft: boolean; next_start: string | null; next_end: string | null; ready: boolean; }
export interface OverviewSuper { run_id: number; reference: string; amount: number; due_date: string | null; overdue: boolean; }
export interface Overview {
  employees: number; fy_label: string; fy_totals: Totals;
  attention: OverviewAttention[]; drafts: OverviewDraft[]; up_next: OverviewNext[]; super_owing: OverviewSuper[];
}

export interface TimesheetEmployee { employee_id: number; name: string; hourly_rate: number | null; hours: Record<string, number | null>; total: number; status: 'draft' | 'approved'; locked_in: string | null; }
export interface TimesheetWeekData { week_start: string; week_end: string; days: string[]; employees: TimesheetEmployee[]; }

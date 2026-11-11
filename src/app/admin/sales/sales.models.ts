import { AmountsAre, DiscountMethod } from './sales-totals';

export type InvoiceStatus = 'draft' | 'awaiting' | 'overdue' | 'paid' | 'void';
export type QuoteStatus = 'draft' | 'sent' | 'expired' | 'accepted' | 'declined' | 'invoiced';
export type DocKind = 'invoice' | 'quote';

export interface Meta { page: number; per_page: number; total: number; last_page: number; }

export interface Summary {
  business: { name: string; abn: string | null; gst_registered: boolean; has_bank_details: boolean };
  owed: { amount: number; count: number };
  overdue: { amount: number; count: number };
  received_30_days: { amount: number; count: number };
  drafts: { amount: number; count: number };
  quotes_awaiting: { amount: number; count: number };
  overdue_list: { id: number; number: string; customer_name: string; due_date: string; days_overdue: number; amount_due: number }[];
  recent: { id: number; number: string; customer_name: string; issue_date: string; total: number; status: InvoiceStatus }[];
  monthly: { month: string; label: string; invoiced: number; received: number }[];
  totals: { invoices: number; quotes: number; customers: number };
}

export interface DocRow {
  id: number;
  number: string;
  customer_name: string;
  reference: string | null;
  issue_date: string;
  due_date?: string | null;      // invoices
  expiry_date?: string | null;   // quotes
  total: number;
  amount_due?: number;           // invoices
  status: string;
  recurring?: boolean;           // invoices made by a repeat schedule
}

export interface DocList { data: DocRow[]; counts: Record<string, number>; meta: Meta; }

export interface DocLine { description: string; quantity: number; rate: number; gst_rate: number; amount?: number; gst?: number; }

export interface Party { name: string; abn: string | null; address: string[]; }
export interface Seller extends Party { gst_registered: boolean; bank: { account_name: string; bsb: string; account_number: string } | null; }
export interface CustomerCard { id: number; name: string; type: string; abn: string | null; email: string | null; phone: string | null; address: string[]; }

export interface Payment { id: number; date: string; amount: number; method: string; reference: string | null; notes: string | null; }

export interface Doc {
  id: number;
  recurring?: boolean;
  last_reminder?: string | null;
  kind: DocKind;
  title: string;
  number: string;
  status: string;
  reference: string | null;
  issue_date: string;
  due_date?: string | null;
  expiry_date?: string | null;
  terms?: string | null;
  amounts_are: AmountsAre;
  seller: Seller;
  customer: CustomerCard | null;
  lines: DocLine[];
  discount_method: DiscountMethod;
  discount_value: number;
  notes: string | null;
  invoice_id?: number | null;
  totals: { gross?: number; discount: number; subtotal: number; gst: number; total: number; paid?: number; amount_due?: number };
  payments?: Payment[];
  can: Record<string, boolean>;
}

export interface DocPayload {
  customer_id: number | null;
  issue_date: string;
  due_date?: string;
  expiry_date?: string;
  terms?: string | null;
  reference: string | null;
  amounts_are: AmountsAre;
  discount_method: DiscountMethod;
  discount_value: number;
  notes: string | null;
  lines: { description: string; quantity: number; rate: number; gst_rate: number }[];
  action?: 'draft' | 'issue' | 'send';
}

export type PaymentFlag = 'overdue' | 'pays_late' | 'reliable';
export interface PaymentProfile {
  invoice_count: number; paid_count: number; late_count: number; avg_days_late: number;
  outstanding: number; overdue: number; overdue_count: number; oldest_overdue_days: number; flags: PaymentFlag[];
}
export interface CustomerRow { id: number; name: string; type: string; abn: string | null; email: string | null; phone: string | null; status: 'active' | 'archived'; payment?: PaymentProfile | null; }
export interface CustomerFull extends CustomerRow {
  first_name: string | null; last_name: string | null; business_name: string | null; mobile: string | null;
  address_line: string | null; suburb: string | null; state: string | null; postcode: string | null;
}
export interface CustomerPayload {
  type: 'Company' | 'Individual' | 'Sole Trader';
  business_name: string | null; first_name: string | null; last_name: string | null;
  abn: string | null; email: string | null; phone: string | null;
  address_line: string | null; suburb: string | null; state: string | null; postcode: string | null;
}
export interface PickCustomer { id: number; name: string; abn: string | null; }

export interface BusinessInfo { name: string; abn: string | null; gst_registered: boolean; has_bank_details: boolean; }

export type Frequency = 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';
export interface RecurringRow {
  id: number; source_invoice_id: number; source_number: string | null; customer: string | null; amount: number;
  frequency: Frequency; frequency_label: string; next_date: string; end_date: string | null;
  active: boolean; drafts_created: number; last_run_at: string | null;
}

export interface FirmOverdueInvoice { id: number; number: string; customer_name: string; due_date: string; days_overdue: number; amount_due: number; }
export interface FirmOverdueClient { company_id: number; company_name: string; overdue: number; count: number; oldest_days: number; invoices: FirmOverdueInvoice[]; }
export interface FirmOverdue { total: number; count: number; client_count: number; clients: FirmOverdueClient[]; }

export interface ReminderDraft {
  tone: 'friendly' | 'follow_up' | 'final'; subject: string; body: string; to: string | null; days_overdue: number;
  history: { id: number; date: string; tone: string; channel: string }[];
}

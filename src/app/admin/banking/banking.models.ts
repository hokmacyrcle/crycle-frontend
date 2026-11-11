export type AccountType = 'everyday' | 'savings' | 'credit_card';

export const ACCOUNT_TYPES: { key: AccountType; label: string; hint: string }[] = [
  { key: 'everyday', label: 'Everyday', hint: 'Day to day account with a debit card' },
  { key: 'savings', label: 'Savings', hint: 'Savings or term deposit' },
  { key: 'credit_card', label: 'Credit card', hint: 'Business credit card' }
];

export interface BankAccount {
  id: number; name: string; type: AccountType; type_label: string;
  bsb: string | null; account_number: string | null; last4: string | null;
  active: boolean; last_imported_at: string | null; to_review: number; feed_connected: boolean;
  feed_link_id: number | null; bank_balance: number | null; last_synced_at: string | null;
}

export interface AccountPayload { name: string; type: AccountType; bsb: string | null; account_number: string | null; }

export type TxnStatus = 'review' | 'done' | 'excluded';

export interface BankTxn { id: number; date: string; description: string; amount: number; status: TxnStatus; account_id?: number; account_name?: string; }

export interface BankSummary { accounts: number; to_review: number; money_in_30: number; money_out_30: number; recent: BankTxn[]; }

export interface TxnPage {
  data: BankTxn[];
  counts: Record<TxnStatus, number>;
  meta: { page: number; per_page: number; total: number; last_page: number };
}

export interface ColumnMap { date: number | null; description: number | null; amount: number | null; debit: number | null; credit: number | null; balance: number | null; }

export interface ImportPreview {
  has_header: boolean; headers: string[]; mapping: ColumnMap; sample: string[][]; rows: number;
  outflow_positive_suggested: boolean; split_suggested: boolean;
}

export interface ImportResult { import_id: number; imported: number; skipped: number; unreadable: number; problems: string[]; }

export interface FeedStatus { configured: boolean; demo: boolean; }
export interface Institution { id: string; name: string; }
export interface FeedAccount { ref: string; name: string; mask: string | null; bsb: string | null; type: AccountType | null; balance: number | null; already_connected: boolean; }
export interface FeedAccounts { institution_name: string; consent_expires: string | null; accounts: FeedAccount[]; }
export interface FeedConnectResult { accounts_added: number; transactions: number; consent_expires: string | null; }

export interface TxnFilter { search: string; from: string; to: string; type: '' | 'in' | 'out'; }

export interface Receipt {
  id: number; file_name: string; is_image: boolean; size: number; description: string | null;
  date: string | null; amount: number | null; gst: number | null; account_id: number | null;
  account_name: string | null; created_by: string | null; created_at: string | null;
}

export interface ReceiptPage {
  data: Receipt[];
  meta: { page: number; per_page: number; total: number; last_page: number };
}

export interface ReceiptPayload { description: string | null; date: string | null; amount: number | null; gst: number | null; account_id: number | null; }

export type ChartType = 'asset' | 'liability' | 'equity' | 'income' | 'expense';

export interface ChartAccount {
  id: number; code: string | null; name: string; type: ChartType; detail: string; gst_code: string; gst_label: string;
  description: string | null; parent_id: number | null; parent_name: string | null; locked: boolean; active: boolean;
}
export interface ChartTypeInfo { key: ChartType; label: string; details: string[]; }
export interface GstCodeInfo { key: string; label: string; rate: string; }
export interface ChartData { data: ChartAccount[]; types: ChartTypeInfo[]; gst_codes: GstCodeInfo[]; }
export interface ChartPayload { code: string | null; name: string; type: ChartType; detail: string; gst_code: string; description: string | null; parent_id: number | null; }

export interface ReconHistory {
  id: number; statement_end: string; opening_balance: number; closing_balance: number; line_count: number;
  finished_by: string | null; finished_at: string | null; can_undo: boolean;
}
export interface ReconStart {
  account: { id: number; name: string; type: AccountType };
  opening_balance: number | null; last_statement_end: string | null; history: ReconHistory[];
}
export interface ReconLine { id: number; date: string; description: string; amount: number; }
export interface ReconLines { lines: ReconLine[]; total: number; truncated: boolean; }

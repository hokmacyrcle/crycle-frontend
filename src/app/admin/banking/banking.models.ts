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

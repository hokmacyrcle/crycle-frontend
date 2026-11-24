export const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft', awaiting: 'Awaiting payment', overdue: 'Overdue', paid: 'Paid', void: 'Void',
  sent: 'Sent', expired: 'Expired', accepted: 'Accepted', declined: 'Declined', invoiced: 'Invoiced',
};

export const INVOICE_FILTERS = [
  { key: 'all', label: 'All' }, { key: 'draft', label: 'Draft' }, { key: 'awaiting', label: 'Awaiting payment' },
  { key: 'overdue', label: 'Overdue' }, { key: 'paid', label: 'Paid' }, { key: 'void', label: 'Void' },
];

export const QUOTE_FILTERS = [
  { key: 'all', label: 'All' }, { key: 'draft', label: 'Draft' }, { key: 'sent', label: 'Sent' },
  { key: 'accepted', label: 'Accepted' }, { key: 'declined', label: 'Declined' }, { key: 'invoiced', label: 'Invoiced' },
];

export const PAYMENT_METHODS = ['Bank transfer', 'Cash', 'Cheque', 'Card', 'Other'];

export const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

/** Payment terms people actually use in Australia. The due date is worked out from the invoice date. */
export const TERMS = [
  { key: 'receipt', label: 'Due on receipt' },
  { key: '7', label: 'Due in 7 days' },
  { key: '14', label: 'Due in 14 days' },
  { key: '30', label: 'Due in 30 days' },
  { key: 'eom', label: 'End of this month' },
  { key: 'eonm', label: '30 days after end of month' },
  { key: 'custom', label: 'Choose a date' },
];

const pad = (n: number) => String(n).padStart(2, '0');
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => iso(new Date());
export const addDays = (isoDate: string, days: number) => { const d = new Date(isoDate + 'T00:00:00'); d.setDate(d.getDate() + days); return iso(d); };
const endOfMonth = (isoDate: string) => { const d = new Date(isoDate + 'T00:00:00'); return iso(new Date(d.getFullYear(), d.getMonth() + 1, 0)); };

export function dueFromTerm(term: string, issue: string): string | null {
  switch (term) {
    case 'receipt': return issue;
    case '7': return addDays(issue, 7);
    case '14': return addDays(issue, 14);
    case '30': return addDays(issue, 30);
    case 'eom': return endOfMonth(issue);
    case 'eonm': return addDays(endOfMonth(issue), 30);
    default: return null;
  }
}

export function termKeyFor(label: string | null | undefined): string {
  return TERMS.find(t => t.label === label)?.key ?? 'custom';
}

export const FREQUENCIES: { key: string; label: string }[] = [
  { key: 'weekly', label: 'Every week' }, { key: 'fortnightly', label: 'Every 2 weeks' }, { key: 'monthly', label: 'Every month' },
  { key: 'quarterly', label: 'Every 3 months' }, { key: 'yearly', label: 'Every year' },
];

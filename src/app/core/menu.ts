export interface MenuItem {
  key: string;
  label: string;
  icon: string; // Material icon name
  route: string;
}

const HOME: MenuItem = { key: 'home', label: 'Home', icon: 'home', route: '/admin/Dashboard' };
const SETTINGS: MenuItem = { key: 'settings', label: 'Settings', icon: 'settings', route: '/admin/settings' };

/** Sidebar on desktop. */
export function sideMenu(context: 'firm' | 'client'): MenuItem[] {
  return context === 'firm'
    ? [
        HOME,
        { key: 'businesses', label: 'Client businesses', icon: 'apartment', route: '/admin/companies' },
        SETTINGS,
      ]
    : [
        HOME,
        { key: 'sales', label: 'Sales', icon: 'receipt_long', route: '/admin/sales' },
        { key: 'payroll', label: 'Payroll', icon: 'account_balance_wallet', route: '/admin/payroll' },
        { key: 'expenses', label: 'Expenses', icon: 'credit_card', route: '/admin/expenses' },
        { key: 'customers', label: 'Customers', icon: 'groups', route: '/admin/clients' },
        { key: 'contacts', label: 'Contacts', icon: 'contacts', route: '/admin/contacts' },
        { key: 'banking', label: 'Banking', icon: 'account_balance', route: '/admin/Banktransactions' },
        SETTINGS,
      ];
}

/** Bottom tab bar on phones (max 5). The rest goes under "More". */
export function tabMenu(context: 'firm' | 'client'): MenuItem[] {
  return context === 'firm'
    ? [
        HOME,
        { key: 'businesses', label: 'Businesses', icon: 'apartment', route: '/admin/companies' },
        SETTINGS,
      ]
    : [
        HOME,
        { key: 'sales', label: 'Sales', icon: 'receipt_long', route: '/admin/sales' },
        { key: 'payroll', label: 'Payroll', icon: 'account_balance_wallet', route: '/admin/payroll' },
        { key: 'expenses', label: 'Expenses', icon: 'credit_card', route: '/admin/expenses' },
      ];
}

/** Items shown in the phone "More" sheet (client context only). */
export function moreMenu(context: 'firm' | 'client'): MenuItem[] {
  if (context === 'firm') return [];
  const inTabs = new Set(tabMenu('client').map(m => m.key));
  return sideMenu('client').filter(m => !inTabs.has(m.key));
}

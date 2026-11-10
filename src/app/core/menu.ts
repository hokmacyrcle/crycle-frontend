export interface MenuItem {
  key: string;
  label: string;
  icon: string; // name in the app icon set (admin/ui/icon.component.ts)
  route: string;
}

const HOME: MenuItem = { key: 'home', label: 'Home', icon: 'home', route: '/admin/Dashboard' };
const SETTINGS: MenuItem = { key: 'settings', label: 'Settings', icon: 'settings', route: '/admin/settings' };

/** Sidebar on desktop. */
export function sideMenu(context: 'firm' | 'client'): MenuItem[] {
  return context === 'firm'
    ? [
        HOME,
        { key: 'businesses', label: 'Client businesses', icon: 'building', route: '/admin/companies' },
        SETTINGS,
      ]
    : [
        HOME,
        { key: 'sales', label: 'Sales', icon: 'sales', route: '/admin/sales' },
        { key: 'payroll', label: 'Payroll', icon: 'payroll', route: '/admin/payroll' },
        { key: 'expenses', label: 'Expenses', icon: 'expenses', route: '/admin/expenses' },
        { key: 'customers', label: 'Customers', icon: 'customers', route: '/admin/sales/customers' },
        { key: 'banking', label: 'Banking', icon: 'bank', route: '/admin/Banktransactions' },
        SETTINGS,
      ];
}

/** Bottom tab bar on phones (max 5). The rest goes under "More". */
export function tabMenu(context: 'firm' | 'client'): MenuItem[] {
  return context === 'firm'
    ? [
        HOME,
        { key: 'businesses', label: 'Businesses', icon: 'building', route: '/admin/companies' },
        SETTINGS,
      ]
    : [
        HOME,
        { key: 'sales', label: 'Sales', icon: 'sales', route: '/admin/sales' },
        { key: 'payroll', label: 'Payroll', icon: 'payroll', route: '/admin/payroll' },
        { key: 'expenses', label: 'Expenses', icon: 'expenses', route: '/admin/expenses' },
      ];
}

/** Items shown in the phone "More" sheet (client context only). */
export function moreMenu(context: 'firm' | 'client'): MenuItem[] {
  if (context === 'firm') return [];
  const inTabs = new Set(tabMenu('client').map(m => m.key));
  return sideMenu('client').filter(m => !inTabs.has(m.key));
}

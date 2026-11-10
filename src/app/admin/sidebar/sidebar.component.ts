import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @Input() isSidebarOpen = false;
  @Input() activeSection = 'dashboard';
  @Output() sectionChange = new EventEmitter<string>();

  menuItems = [
    { section: 'dashboard', label: 'Dashboard', icon: 'assets/images/Dashboard/dashboardsidebar.png', route: '/admin/Dashboard' },
    { section: 'Clients', label: 'Clients', icon: 'assets/images/Dashboard/dashboardsidebar.png', route: '/admin/clients' },
    { section: 'Companies', label: 'Companies', icon: 'assets/images/Dashboard/dashboardsidebar.png', route: '/admin/companies' },
    { section: 'invoices', label: 'Invoices', icon: 'assets/images/Dashboard/dashboardsidebar.png', route: '/admin/getallinvoice' },
    { section: 'Employees', label: 'Employees', icon: 'assets/images/Dashboard/banklogo.png', route: '/admin/Employees' },
    { section: 'contacts', label: 'contacts', icon: 'assets/images/Dashboard/banklogo.png', route: '/admin/contacts' },
    { section: 'sales', label: 'Sales', icon: 'assets/images/Dashboard/saleslogo.png', route: '/admin/sales' },
    { section: 'expenses', label: 'Expenses', icon: 'assets/images/Dashboard/expenseslogo.png', route: '/expenses' },
    { section: 'sales', label: 'Sales', icon: 'assets/images/Dashboard/saleslogo.png', route: '/sales' },
    { section: 'Payroll', label: 'Payroll', icon: 'assets/images/Dashboard/saleslogo.png', route: '/admin/payroll' },
    { section: 'projects', label: 'Projects', icon: 'assets/images/Dashboard/projectlogo.png', route: '/projects' },
    { section: 'workers', label: 'Workers', icon: 'assets/images/Dashboard/workerlogo.png', route: '/workers' },
    { section: 'reports', label: 'Reports', icon: 'assets/images/Dashboard/reportlogo.png', route: '/reports' },
    { section: 'taxes', label: 'Taxes', icon: 'assets/images/Dashboard/taxeslogo.png', route: '/taxes' },
    { section: 'account', label: 'My Account', icon: 'assets/images/Dashboard/accountlogo.png', route: '/account' },

  ];

  setActiveSection(section: string) {
    this.activeSection = section;
    this.sectionChange.emit(section);
  }
}

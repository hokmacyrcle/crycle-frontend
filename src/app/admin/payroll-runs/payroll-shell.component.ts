import { Component } from '@angular/core';

/** Frame for Payroll: the title and the section tabs. */
@Component({
  selector: 'app-payroll-shell',
  template: `
<div class="mx-auto max-w-4xl text-cyrcle-navy">
  <div class="m-0 text-[28px] font-extrabold leading-tight" role="heading" aria-level="1">Payroll</div>
  <nav class="mt-4 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-cyrcle-pearl" aria-label="Payroll sections">
    <a *ngFor="let t of tabs" [routerLink]="t.link" routerLinkActive #rla="routerLinkActive" [routerLinkActiveOptions]="{ exact: true }"
       class="-mb-px whitespace-nowrap border-b-[3px] px-3 py-3 text-sm font-bold sm:px-4"
       [ngClass]="rla.isActive ? 'border-cyrcle-poppy text-cyrcle-navy' : 'border-transparent text-[#5B6478] hover:text-cyrcle-navy'"
       [attr.aria-current]="rla.isActive ? 'page' : null">{{ t.label }}</a>
  </nav>
  <div class="mt-5"><router-outlet></router-outlet></div>
</div>`
})
export class PayrollShellComponent {
  tabs = [
    { label: 'Overview', link: '/admin/payroll' },
    { label: 'Pay runs', link: '/admin/payroll/runs' },
    { label: 'Employees', link: '/admin/payroll/employees' },
    { label: 'Timesheets', link: '/admin/payroll/timesheets' },
    { label: 'Leave', link: '/admin/payroll/leave' },
    { label: 'History', link: '/admin/payroll/history' },
    { label: 'Calculator', link: '/admin/payroll/calculator' },
    { label: 'Settings', link: '/admin/payroll/settings' },
  ];
}

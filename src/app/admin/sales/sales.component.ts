import { Component } from '@angular/core';

/** Frame for the four Sales lists: title, the New buttons and the section tabs. */
@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html'
})
export class SalesComponent {
  tabs = [
    { label: 'Overview', link: '/admin/sales', exact: true },
    { label: 'Invoices', link: '/admin/sales/invoices', exact: false },
    { label: 'Quotes', link: '/admin/sales/quotes', exact: false },
    { label: 'Customers', link: '/admin/sales/customers', exact: false },
  ];
}

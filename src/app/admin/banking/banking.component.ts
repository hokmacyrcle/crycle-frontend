import { Component } from '@angular/core';

/** Frame for the Banking pages: title, the Add account button and the section tabs. */
@Component({
  selector: 'app-banking',
  templateUrl: './banking.component.html'
})
export class BankingComponent {
  tabs = [
    { label: 'Overview', link: '/admin/Banktransactions', exact: true },
    { label: 'Transactions', link: '/admin/Banktransactions/transactions', exact: false },
    { label: 'Receipts', link: '/admin/Banktransactions/receipts', exact: false },
    { label: 'Chart of accounts', link: '/admin/Banktransactions/chart-of-accounts', exact: false },
    { label: 'Reconcile', link: '/admin/Banktransactions/reconcile', exact: false },
    { label: 'Accounts', link: '/admin/Banktransactions/accounts', exact: false },
  ];
}

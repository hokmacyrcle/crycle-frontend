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
    { label: 'Accounts', link: '/admin/Banktransactions/accounts', exact: false },
  ];
}

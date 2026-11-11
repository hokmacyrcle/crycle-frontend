import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UpdateclientComponent } from './updateclient/updateclient.component';
import { ClientsComponent } from './clients/clients.component';
import { CompaniesComponent } from './companies/companies.component';
import { UpdatecompanyComponent } from './updatecompany/updatecompany.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { GetallinvoicesComponent } from './getallinvoices/getallinvoices.component';
import { GetallcustomerComponent } from './getallcustomer/getallcustomer.component';
import { AddcontactComponent } from './addcontact/addcontact.component';

import { OpeningbalanceComponent } from './openingbalance/openingbalance.component';
import { NotesComponent } from './notes/notes.component';
import { SalesComponent } from './sales/sales.component';
import { QuoteViewComponent } from './quote-view/quote-view.component';
import { InvoiceViewEditComponent } from './invoice-view-edit/invoice-view-edit.component';
import { CreateQuoteComponent } from './create-quote/create-quote.component';
import { BanktransactionsComponent } from './banktransactions/banktransactions.component';
import { BanktransactiontableComponent } from './banktransactiontable/banktransactiontable.component';
import { BankapptransactionsComponent } from './bankapptransactions/bankapptransactions.component';
import { BanktransactionreceiptsComponent } from './banktransactionreceipts/banktransactionreceipts.component';
import { ReconcileComponent } from './reconcile/reconcile.component';
import { BankrulestransactionsComponent } from './bankrulestransactions/bankrulestransactions.component';
import { BankchartofaccountsComponent } from './bankchartofaccounts/bankchartofaccounts.component';
import { BankRecurringTransactionsComponent } from './bank-recurring-transactions/bank-recurring-transactions.component';
import { SettingOrganisationComponent } from './setting-organisation/setting-organisation.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { ExpenseCreateBillComponent } from './expense-create-bill/expense-create-bill.component';
import { ExpenseCreateExpenseComponent } from './expense-create-expense/expense-create-expense.component';
import { ExpenseCreatePurchaseOrderComponent } from './expense-create-purchase-order/expense-create-purchase-order.component';
import { ExpenseCreateSupplierCreditComponent } from './expense-create-supplier-credit/expense-create-supplier-credit.component';
import { ExpenseCreateChequeComponent } from './expense-create-cheque/expense-create-cheque.component';
import { FeedbackDialogComponent } from './feedback-dialog/feedback-dialog.component';
import { SalesOverviewComponent } from './sales/sales-overview.component';
import { DocListComponent } from './sales/doc-list.component';
import { DocFormComponent } from './sales/doc-form.component';
import { DocViewComponent } from './sales/doc-view.component';
import { CustomerListComponent } from './sales/customer-list.component';
import { CustomerFormComponent } from './sales/customer-form.component';

import { EmployeeListComponent } from './payroll-employees/employee-list.component';
import { EmployeeFormComponent } from './payroll-employees/employee-form.component';
import { PayrollShellComponent } from './payroll-runs/payroll-shell.component';
import { PayRunListComponent } from './payroll-runs/pay-run-list.component';
import { PayRunNewComponent } from './payroll-runs/pay-run-new.component';
import { PayRunComponent } from './payroll-runs/pay-run.component';
import { PayslipComponent } from './payroll-runs/payslip.component';
import { PayCalculatorComponent } from './payroll-runs/pay-calculator.component';
import { PayrollSettingsComponent } from './payroll-runs/payroll-settings.component';
import { PayHistoryComponent } from './payroll-runs/pay-history.component';
import { PayrollHomeComponent } from './payroll-runs/payroll-home.component';
import { TimesheetsComponent } from './payroll-runs/timesheets.component';
import { LeaveComponent } from './payroll-runs/leave.component';
import { SectionPlaceholderComponent } from './section-placeholder/section-placeholder.component';
import { roleGuard } from '../core/auth.guard';
import { SettingsComponent } from './settings/settings.component';
import { ClientBusinessesComponent } from './client-businesses/client-businesses.component';
import { ClientBusinessFormComponent } from './client-business-form/client-business-form.component';
import { EmployeeHomeComponent } from './employee-home/employee-home.component';

const routes: Routes = [
  { path: 'Dashboard', component: DashboardComponent },
  { path: 'my-home', component: EmployeeHomeComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'updateclient/:id', component: UpdateclientComponent },
  { path: 'companies', component: ClientBusinessesComponent },
  { path: 'companies/new', component: ClientBusinessFormComponent },
  { path: 'companies/:id/edit', component: ClientBusinessFormComponent },
  { path: 'updatecompany/:id', component: UpdatecompanyComponent },
  { path: 'Employees', redirectTo: 'payroll/employees', pathMatch: 'full' },
  { path: 'AddEmployee', redirectTo: 'payroll/employees/new', pathMatch: 'full' },
  { path: 'employees/edit/:id', redirectTo: 'payroll/employees', pathMatch: 'full' },
  { path: 'addinvoice', redirectTo: 'sales/invoices/new', pathMatch: 'full' },
  { path: 'create-quote', redirectTo: 'sales/quotes/new', pathMatch: 'full' },
  { path: 'getallinvoice', redirectTo: 'sales/invoices', pathMatch: 'full' },
  { path: 'clients', redirectTo: 'sales/customers', pathMatch: 'full' },
  { path: 'contacts', redirectTo: 'sales/customers', pathMatch: 'full' },
  { path: 'add-contact', component: AddcontactComponent },
  { path: 'update-contact/:id', component: AddcontactComponent },

  // Payroll: pay runs and employees share one frame with tabs; forms and payslips open on their own.
  { path: 'payroll/employees/new', component: EmployeeFormComponent },
  { path: 'payroll/employees/:id/edit', component: EmployeeFormComponent },
  { path: 'payroll/runs/new', component: PayRunNewComponent },
  { path: 'payroll/runs/:id/payslip/:lineId', component: PayslipComponent },
  { path: 'payroll/runs/:id', component: PayRunComponent },
  {
    path: 'payroll', component: PayrollShellComponent, children: [
      { path: '', component: PayrollHomeComponent },
      { path: 'runs', component: PayRunListComponent },
      { path: 'employees', component: EmployeeListComponent },
      { path: 'timesheets', component: TimesheetsComponent },
      { path: 'leave', component: LeaveComponent },
      { path: 'history', component: PayHistoryComponent },
      { path: 'calculator', component: PayCalculatorComponent },
      { path: 'settings', component: PayrollSettingsComponent },
    ]
  },
  { path: 'payroll/:rest', redirectTo: 'payroll', pathMatch: 'full' },

  // Other routes
  // Sales: form and document pages first, then the tabbed shell
  { path: 'sales/invoices/new', component: DocFormComponent, data: { kind: 'invoice' } },
  { path: 'sales/invoices/:id/edit', component: DocFormComponent, data: { kind: 'invoice' } },
  { path: 'sales/invoices/:id', component: DocViewComponent, data: { kind: 'invoice' } },
  { path: 'sales/quotes/new', component: DocFormComponent, data: { kind: 'quote' } },
  { path: 'sales/quotes/:id/edit', component: DocFormComponent, data: { kind: 'quote' } },
  { path: 'sales/quotes/:id', component: DocViewComponent, data: { kind: 'quote' } },
  // Customers has its own page: no Sales title, tabs or New quote and New invoice buttons around it
  { path: 'sales/customers', component: CustomerListComponent },
  { path: 'sales/customers/new', component: CustomerFormComponent },
  { path: 'sales/customers/:id/edit', component: CustomerFormComponent },
  {
    path: 'sales',
    component: SalesComponent,
    children: [
      { path: '', component: SalesOverviewComponent },
      { path: 'invoices', component: DocListComponent, data: { kind: 'invoice' } },
      { path: 'quotes', component: DocListComponent, data: { kind: 'quote' } },
    ]
  },

  // Banking and Expenses are not built yet; the old screens held sample data and are no longer routed.
  {
    path: 'Banktransactions', component: SectionPlaceholderComponent,
    data: {
      title: 'Banking', icon: 'bank',
      blurb: 'See what came in and went out of your bank account.',
      planned: [
        'Connect your bank account',
        'Match bank transactions to invoices and bills',
        'Reconcile your accounts each month'
      ]
    }
  },
  {
    path: 'expenses', component: SectionPlaceholderComponent,
    data: {
      title: 'Expenses', icon: 'expenses',
      blurb: 'Keep track of what you spend and what you owe.',
      planned: [
        'Record bills from suppliers and pay them',
        'Claim GST credits on what you buy',
        'Keep receipts with each expense',
        'See what you owe and when it is due'
      ]
    }
  },
  { path: 'Banktransactionstable', redirectTo: 'Banktransactions', pathMatch: 'full' },
  { path: 'Bankapptransactions', redirectTo: 'Banktransactions', pathMatch: 'full' },
  { path: 'Banktransactionsreceipt', redirectTo: 'Banktransactions', pathMatch: 'full' },
  { path: 'Reconcile', redirectTo: 'Banktransactions', pathMatch: 'full' },
  { path: 'Bankrules', redirectTo: 'Banktransactions', pathMatch: 'full' },
  { path: 'Bankcharts', redirectTo: 'Banktransactions', pathMatch: 'full' },
  { path: 'BankRecurring', redirectTo: 'Banktransactions', pathMatch: 'full' },
  { path: 'expense-create-bill', redirectTo: 'expenses', pathMatch: 'full' },
  { path: 'expense-create-expense', redirectTo: 'expenses', pathMatch: 'full' },
  { path: 'expense-create-purchase-order', redirectTo: 'expenses', pathMatch: 'full' },
  { path: 'expense-create-supplier-credit', redirectTo: 'expenses', pathMatch: 'full' },
  { path: 'expense-create-cheque', redirectTo: 'expenses', pathMatch: 'full' },

  // Feedback dialog
  { path: 'feedback-dialog', component: FeedbackDialogComponent },

  // Default redirect
  { path: '', redirectTo: '/admin/Dashboard', pathMatch: 'full' }
];

const guardedRoutes: Routes = [
  { path: '', canActivateChild: [roleGuard], children: routes }
];

@NgModule({
  imports: [RouterModule.forChild(guardedRoutes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

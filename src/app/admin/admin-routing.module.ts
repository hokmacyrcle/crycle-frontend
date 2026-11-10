import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UpdateclientComponent } from './updateclient/updateclient.component';
import { ClientsComponent } from './clients/clients.component';
import { CompaniesComponent } from './companies/companies.component';
import { UpdatecompanyComponent } from './updatecompany/updatecompany.component';
import { EmployeesComponent } from './employees/employees.component';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { GetallinvoicesComponent } from './getallinvoices/getallinvoices.component';
import { GetallcustomerComponent } from './getallcustomer/getallcustomer.component';
import { AddcontactComponent } from './addcontact/addcontact.component';

import { PayrollComponent } from './payroll/payroll.component';
import { PayrollEmployeeComponent } from './payroll-employee/payroll-employee.component';
import { PayrollAddEmployeeComponent } from './payroll-add-employee/payroll-add-employee.component';
import { PayrollEmployeeDetailsComponent } from './payroll-employee-details/payroll-employee-details.component';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { EmployementComponent } from './employement/employement.component';
import { TaxesComponent } from './taxes/taxes.component';
import { LeaveComponent } from './leave/leave.component';
import { BankaccountComponent } from './bankaccount/bankaccount.component';
import { PayslipsComponent } from './payslips/payslips.component';
import { PaytemplateComponent } from './paytemplate/paytemplate.component';
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
import { PayrollLeaveComponent } from './payroll-leave/payroll-leave.component';
import { PayrollTimesheetComponent } from './payroll-timesheet/payroll-timesheet.component';
import { PayrollTimesheetDetailsComponent } from './payroll-timesheet-details/payroll-timesheet-details.component';
import { PayEmployeesComponent } from './pay-employees/pay-employees.component';
import { PayEmployeesDetailsComponent } from './pay-employees-details/pay-employees-details.component';
import { PayrollHistoryComponent } from './payroll-history/payroll-history.component';
import { PayrollSettingComponent } from './payroll-setting/payroll-setting.component';
import { SettingHolidaysComponent } from './setting-holidays/setting-holidays.component';
import { SettingPayfrequencisComponent } from './setting-payfrequencis/setting-payfrequencis.component';
import { SettingOrganisationComponent } from './setting-organisation/setting-organisation.component';
import { SettingPayitemsComponent } from './setting-payitems/setting-payitems.component';
import { SettingSuperannuationComponent } from './setting-superannuation/setting-superannuation.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { ExpenseCreateBillComponent } from './expense-create-bill/expense-create-bill.component';
import { ExpenseCreateExpenseComponent } from './expense-create-expense/expense-create-expense.component';
import { ExpenseCreatePurchaseOrderComponent } from './expense-create-purchase-order/expense-create-purchase-order.component';
import { ExpenseCreateSupplierCreditComponent } from './expense-create-supplier-credit/expense-create-supplier-credit.component';
import { ExpenseCreateChequeComponent } from './expense-create-cheque/expense-create-cheque.component';
import { FeedbackDialogComponent } from './feedback-dialog/feedback-dialog.component';

const routes: Routes = [
  { path: 'Dashboard', component: DashboardComponent },
  { path: 'clients', component: ClientsComponent },
  { path: 'updateclient/:id', component: UpdateclientComponent },
  { path: 'companies', component: CompaniesComponent },
  { path: 'updatecompany/:id', component: UpdatecompanyComponent },
  { path: 'Employees', component: EmployeesComponent },
  { path: 'AddEmployee', component: AddEmployeeComponent },
  { path: 'employees/edit/:id', component: AddEmployeeComponent },
  { path: 'addinvoice', component: InvoiceComponent },
  { path: 'getallinvoice', component: GetallinvoicesComponent },
  { path: 'contacts', component: GetallcustomerComponent },
  { path: 'invoices/:id', component: InvoiceComponent },
  { path: 'add-contact', component: AddcontactComponent },
  { path: 'update-contact/:id', component: AddcontactComponent },

  // Payroll Routes
  {
    path: 'payroll',
    component: PayrollComponent,
    children: [
      {
        path: 'payrollemployee',
        component: PayrollEmployeeComponent,
        children: [
          { path: 'employees/add', component: PayrollAddEmployeeComponent, },
          {
            path: 'payrollemployeedetails/:id',
            component: PayrollEmployeeDetailsComponent,
            children: [
              { path: 'details', component: EmployeeDetailsComponent },
              { path: 'employment', component: EmployementComponent },
              { path: 'taxes', component: TaxesComponent },
              { path: 'leave', component: LeaveComponent },
              { path: 'bankaccount', component: BankaccountComponent },
              { path: 'payslips', component: PayslipsComponent },
              { path: 'paytemplate', component: PaytemplateComponent },
              { path: 'openingbalance', component: OpeningbalanceComponent },
              { path: 'notes', component: NotesComponent },
              // Default redirect
              { path: '', redirectTo: 'details', pathMatch: 'full' }
            ]
          }
        ]
      },
      { path: 'payroll-leave', component: PayrollLeaveComponent },
      {
        path: 'payroll-timesheet', component: PayrollTimesheetComponent, children: [
          { path: 'payroll-timesheet-details', component: PayrollTimesheetDetailsComponent },
        ]
      },
      {
        path: 'pay-employees', component: PayEmployeesComponent, children: [
          { path: 'pay-employees-details', component: PayEmployeesDetailsComponent },
        ]
      },
      { path: 'payroll-history', component: PayrollHistoryComponent },
      {
        path: 'payrollsetting',
        component: PayrollSettingComponent,
        children: [
          { path: 'organisation', component: SettingOrganisationComponent },
          { path: 'payfrequencis', component: SettingPayfrequencisComponent },
          { path: 'holidays', component: SettingHolidaysComponent },
          { path: 'payitems', component: SettingPayitemsComponent },
          { path: 'superannuation', component: SettingSuperannuationComponent },
          // Default redirect
          { path: '', redirectTo: 'organisation', pathMatch: 'full' }
        ]
      },
    ]
  },

  // Other routes
  { path: 'sales', component: SalesComponent },
  { path: 'quote/:id', component: QuoteViewComponent },
  { path: 'invoice/:id', component: InvoiceViewEditComponent },
  { path: 'create-quote', component: CreateQuoteComponent },

  // Bank Transactions
  { path: 'Banktransactions', component: BanktransactionsComponent },
  { path: 'Banktransactionstable', component: BanktransactiontableComponent },
  { path: 'Bankapptransactions', component: BankapptransactionsComponent },
  { path: 'Banktransactionsreceipt', component: BanktransactionreceiptsComponent },
  { path: 'Reconcile', component: ReconcileComponent },
  { path: 'Bankrules', component: BankrulestransactionsComponent },
  { path: 'Bankcharts', component: BankchartofaccountsComponent },
  { path: 'BankRecurring', component: BankRecurringTransactionsComponent },

  // Expenses routes
  { path: 'expenses', component: ExpensesComponent },
  { path: 'expense-create-bill', component: ExpenseCreateBillComponent },
  { path: 'expense-create-expense', component: ExpenseCreateExpenseComponent },
  { path: 'expense-create-purchase-order', component: ExpenseCreatePurchaseOrderComponent },
  { path: 'expense-create-supplier-credit', component: ExpenseCreateSupplierCreditComponent },
  { path: 'expense-create-cheque', component: ExpenseCreateChequeComponent },

  // Feedback dialog
  { path: 'feedback-dialog', component: FeedbackDialogComponent },

  // Default redirect
  { path: '', redirectTo: '/Dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

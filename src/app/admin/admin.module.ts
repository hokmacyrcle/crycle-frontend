import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings/settings.component';
import { ClientBusinessesComponent } from './client-businesses/client-businesses.component';
import { ClientBusinessFormComponent } from './client-business-form/client-business-form.component';
import { EmployeeHomeComponent } from './employee-home/employee-home.component';
import { AdminRoutingModule } from './admin-routing.module';
import { ClientsComponent } from './clients/clients.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UpdateclientComponent } from './updateclient/updateclient.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip'; // Add this
import { AdminComponent } from './admin.component';
import { MatSnackBarModule } from '@angular/material/snack-bar'; // Add this
import { MatDialogModule } from '@angular/material/dialog';
import { AddClientComponent } from './add-client/add-client.component';
import { CompaniesComponent } from './companies/companies.component';
import { AddCompanyComponent } from './add-company/add-company.component';
import { UpdatecompanyComponent } from './updatecompany/updatecompany.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InvoiceComponent } from './invoice/invoice.component';
import { GetallinvoicesComponent } from './getallinvoices/getallinvoices.component';
import { GetallcustomerComponent } from './getallcustomer/getallcustomer.component';
import { AddcontactComponent } from './addcontact/addcontact.component';
import { OpeningbalanceComponent } from './openingbalance/openingbalance.component';
import { NotesComponent } from './notes/notes.component';
import { BanktransactionsComponent } from './banktransactions/banktransactions.component';
import { SalesComponent } from './sales/sales.component';
import { QuotesComponent } from './quotes/quotes.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { QuoteViewComponent } from './quote-view/quote-view.component';
import { InvoiceViewEditComponent } from './invoice-view-edit/invoice-view-edit.component';
import { PaymentPopupComponent } from './payment-popup/payment-popup.component';
import { CreateQuoteComponent } from './create-quote/create-quote.component';
import { QuoteViewEditComponent } from './quote-view-edit/quote-view-edit.component';
import { BanktransactiontableComponent } from './banktransactiontable/banktransactiontable.component';
import { BankapptransactionsComponent } from './bankapptransactions/bankapptransactions.component';
import { BanktransactionreceiptsComponent } from './banktransactionreceipts/banktransactionreceipts.component';
import { ReconcileComponent } from './reconcile/reconcile.component';
import { BankrulestransactionsComponent } from './bankrulestransactions/bankrulestransactions.component';
import { BankchartofaccountsComponent } from './bankchartofaccounts/bankchartofaccounts.component';
import { BankRecurringTransactionsComponent } from './bank-recurring-transactions/bank-recurring-transactions.component';
import { SettingOrganisationComponent } from './setting-organisation/setting-organisation.component';
import { MatMenuModule } from '@angular/material/menu';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatSelectModule } from '@angular/material/select';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatMenuModule } from '@angular/material/menu';
// import { MatSidenavModule } from '@angular/material/sidenav';
// import { MatListModule } from '@angular/material/list';
// import { MatButtonModule } from '@angular/material/button';
// import { MatNativeDateModule } from '@angular/material/core';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { PayrollComponent } from './payroll/payroll.component';
// import { MatSidenavModule } from '@angular/material/sidenav';
// import { MatListModule } from '@angular/material/list';
// import { MatButtonModule } from '@angular/material/button';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatMenuModule } from '@angular/material/menu';
// import { MatSelectModule } from '@angular/material/select';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatNativeDateModule } from '@angular/material/core';
// import { MatToolbarModule } from '@angular/material/toolbar';
import { ExpensesComponent } from './expenses/expenses.component';
import { ExpenseTableComponent } from './expense-table/expense-table.component';
import { ExpenseBillsComponent } from './expense-bills/expense-bills.component';
import { ExpensePurchaseComponent } from './expense-purchase/expense-purchase.component';
import { ExpenseSuppliersComponent } from './expense-suppliers/expense-suppliers.component';
import { ExpenseMileageComponent } from './expense-mileage/expense-mileage.component';
import { ExpenseCreateBillComponent } from './expense-create-bill/expense-create-bill.component';
import { ExpenseCreateExpenseComponent } from './expense-create-expense/expense-create-expense.component';
import { ExpenseCreatePurchaseOrderComponent } from './expense-create-purchase-order/expense-create-purchase-order.component';
import { ExpenseCreateSupplierCreditComponent } from './expense-create-supplier-credit/expense-create-supplier-credit.component';
import { ExpenseCreateChequeComponent } from './expense-create-cheque/expense-create-cheque.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { FeedbackDialogComponent } from './feedback-dialog/feedback-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { EmployeeListComponent } from './payroll-employees/employee-list.component';
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
import { EmployeeFormComponent } from './payroll-employees/employee-form.component';
import { SectionPlaceholderComponent } from './section-placeholder/section-placeholder.component';
import { IconComponent } from './ui/icon.component';
import { AudPipe, AbnPipe, AuDatePipe } from './ui/format.pipes';
import { SalesOverviewComponent } from './sales/sales-overview.component';
import { DocListComponent } from './sales/doc-list.component';
import { DocFormComponent } from './sales/doc-form.component';
import { DocViewComponent } from './sales/doc-view.component';
import { RecurringListComponent } from './sales/recurring-list.component';
import { CustomerListComponent } from './sales/customer-list.component';
import { CustomerFormComponent } from './sales/customer-form.component';

@NgModule({
  declarations: [
    EmployeeListComponent, EmployeeFormComponent, PayrollShellComponent, PayRunListComponent, PayRunNewComponent, PayRunComponent, PayslipComponent, PayCalculatorComponent, PayrollSettingsComponent, PayHistoryComponent, PayrollHomeComponent, TimesheetsComponent, LeaveComponent, SectionPlaceholderComponent, IconComponent, AudPipe, AbnPipe, AuDatePipe,
    SalesOverviewComponent, DocListComponent, DocFormComponent, DocViewComponent, RecurringListComponent, CustomerListComponent, CustomerFormComponent,
    DashboardComponent,
    AdminComponent,
    EmployeeHomeComponent,
    ClientBusinessesComponent,
    ClientBusinessFormComponent,
    SettingsComponent,
    SidebarComponent,
    NavbarComponent,
    UpdateclientComponent,
    ClientsComponent,
    AddClientComponent,
    CompaniesComponent,
    AddCompanyComponent,
    UpdatecompanyComponent,
    InvoiceComponent,
    GetallinvoicesComponent,
    InvoiceViewEditComponent,
    CreateQuoteComponent,
    QuoteViewEditComponent,
    GetallcustomerComponent,
    AddcontactComponent,
    OpeningbalanceComponent,
    NotesComponent,
    BanktransactionsComponent,
    AddcontactComponent, SalesComponent, QuotesComponent, QuoteViewComponent,PaymentPopupComponent, BanktransactiontableComponent, BankapptransactionsComponent,
     BanktransactionreceiptsComponent,
     ReconcileComponent,
     BankrulestransactionsComponent,
     BankchartofaccountsComponent,
     BankRecurringTransactionsComponent,
    AddcontactComponent, SalesComponent, QuotesComponent, QuoteViewComponent,PaymentPopupComponent, SettingOrganisationComponent, AddcontactComponent,
    SalesComponent,
    QuotesComponent,
    QuoteViewComponent,
    PaymentPopupComponent,
    ExpensesComponent,
    ExpenseTableComponent,
    ExpenseBillsComponent,
    ExpensePurchaseComponent,
    ExpenseSuppliersComponent,
    ExpenseMileageComponent,
    ExpenseCreateBillComponent,
    ExpenseCreateExpenseComponent,
    ExpenseCreatePurchaseOrderComponent,
    ExpenseCreateSupplierCreditComponent,
    ExpenseCreateChequeComponent,
    FeedbackDialogComponent,
    ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatSortModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCheckboxModule,
     // For mat-datepicker, mat-datepicker-toggle
    MatNativeDateModule,    // Required for mat-datepicker
 
    MatSelectModule,        // For mat-option
    MatButtonModule,
    MatSelectModule,
  
    MatButtonModule,
    MatNativeDateModule,
 
    MatButtonModule,
 
  
    MatNativeDateModule,
    MatSelectModule,
    MatMenuModule,          // For mat-menu and matMenuTriggerFor
    MatSidenavModule,       // For mat-sidenav, mat-sidenav-container, mat-sidenav-content
    MatListModule,          // For mat-nav-list
    MatChipsModule,         // For mat-chip
    MatDatepickerModule,    // For mat-datepicker and mat-calendar
    MatNativeDateModule,    // Required for datepicker functionality
    MatInputModule,         // For matInput directive
    MatButtonModule,        // For mat-raised-button
 

    OverlayModule,
  ],

   exports: [
  ],
  // providers: []
  providers: [{ provide: MatDialogRef, useValue: {} }],
})
export class AdminModule {}

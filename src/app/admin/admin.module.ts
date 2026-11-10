import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings/settings.component';
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
import { EmployeesComponent } from './employees/employees.component';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InvoiceComponent } from './invoice/invoice.component';
import { GetallinvoicesComponent } from './getallinvoices/getallinvoices.component';
import { GetallcustomerComponent } from './getallcustomer/getallcustomer.component';
import { AddcontactComponent } from './addcontact/addcontact.component';
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
import { PayrollLeaveComponent } from './payroll-leave/payroll-leave.component';
import { PayrollTimesheetComponent } from './payroll-timesheet/payroll-timesheet.component';
import { PayrollTimesheetDetailsComponent } from './payroll-timesheet-details/payroll-timesheet-details.component';
import { PayEmployeesComponent } from './pay-employees/pay-employees.component';
import { PayEmployeesDetailsComponent } from './pay-employees-details/pay-employees-details.component';
import { PayrollHistoryComponent } from './payroll-history/payroll-history.component';
import { PayrollSettingComponent } from './payroll-setting/payroll-setting.component';
import { SettingOrganisationComponent } from './setting-organisation/setting-organisation.component';
import { SettingPayfrequencisComponent } from './setting-payfrequencis/setting-payfrequencis.component';
import { SettingHolidaysComponent } from './setting-holidays/setting-holidays.component';
import { SettingPayitemsComponent } from './setting-payitems/setting-payitems.component';
import { SettingSuperannuationComponent } from './setting-superannuation/setting-superannuation.component';
import { PayrollComponent } from './payroll/payroll.component';
import { PayrollOverviewComponent } from './payroll-overview/payroll-overview.component';
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
import { PayrollDashboardComponent } from './payroll-dashboard/payroll-dashboard.component';

@NgModule({
  declarations: [
    DashboardComponent,
    AdminComponent,
    EmployeeHomeComponent,
    SettingsComponent,
    SidebarComponent,
    NavbarComponent,
    UpdateclientComponent,
    ClientsComponent,
    AddClientComponent,
    CompaniesComponent,
    AddCompanyComponent,
    UpdatecompanyComponent,
    EmployeesComponent,
    AddEmployeeComponent,
    InvoiceComponent,
    GetallinvoicesComponent,
    InvoiceViewEditComponent,
    CreateQuoteComponent,
    QuoteViewEditComponent,
    GetallcustomerComponent,
    AddcontactComponent,
    PayrollComponent,
    PayrollEmployeeComponent,
    PayrollAddEmployeeComponent,
    PayrollEmployeeDetailsComponent,
    EmployeeDetailsComponent,
    EmployementComponent,
    TaxesComponent,
    LeaveComponent,
    BankaccountComponent,
    PayslipsComponent,
    PaytemplateComponent,
    OpeningbalanceComponent,
    NotesComponent,
    BanktransactionsComponent,
    AddcontactComponent, SalesComponent, QuotesComponent, QuoteViewComponent,PaymentPopupComponent, BanktransactiontableComponent, BankapptransactionsComponent,
     BanktransactionreceiptsComponent,
     ReconcileComponent,
     BankrulestransactionsComponent,
     BankchartofaccountsComponent,
     BankRecurringTransactionsComponent,
    PayrollOverviewComponent,
    AddcontactComponent, SalesComponent, QuotesComponent, QuoteViewComponent,PaymentPopupComponent, PayrollLeaveComponent, PayrollTimesheetComponent, PayrollTimesheetDetailsComponent, PayEmployeesComponent, PayEmployeesDetailsComponent, PayrollHistoryComponent, PayrollSettingComponent, SettingOrganisationComponent, SettingPayfrequencisComponent, SettingHolidaysComponent, SettingPayitemsComponent, SettingSuperannuationComponent, PayrollComponent,
    AddcontactComponent,
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
    EmployeeDetailsComponent,
    PayrollDashboardComponent,
    PayrollTimesheetComponent,
    PayrollTimesheetDetailsComponent,
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
    PayrollEmployeeDetailsComponent,
    EmployeeDetailsComponent
  ],
  // providers: []
  providers: [{ provide: MatDialogRef, useValue: {} }],
})
export class AdminModule {}

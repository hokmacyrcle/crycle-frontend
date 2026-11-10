import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BankAccount, PayrollService } from 'src/app/services/payroll.service';

@Component({
  selector: 'app-bankaccount',
  templateUrl: './bankaccount.component.html',
  styleUrls: ['./bankaccount.component.scss']
})
export class BankaccountComponent {
  employeeId = 0;
  bankAccounts: any[] = [];
  primaryAccount: any = this.createEmptyAccount(true);
  maxAccounts = 2;
  showHistory = false;

  // 🌀 Track loading
  isSavingPrimary = false;
  savingBankAccounts: { [key: number | string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private payrollService: PayrollService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (id) {
        this.employeeId = +id;
        this.loadBankAccounts(this.employeeId);
      }
    });
  }

  createEmptyAccount(isPrimary = false) {
    return {
      bankAccountId: undefined,
      employeeId: this.employeeId,
      statementText: '',
      accountName: '',
      bsb: '',
      accountNumber: '',
      dollarAmount: '',
      isPrimary,
      status: '',
      created_by: 1,
      updated_by: 1,
      created_at: '',
      updated_at: '',
      primary_account_key: null,
    };
  }

  loadBankAccounts(employeeId: number) {
    this.payrollService.getBankAccountsByEmployeeId(employeeId).subscribe({
      next: (res) => {
        const accounts = res?.data || [];
        const normalizedAccounts = accounts.map((a: any) => ({
          bankAccountId: a.bank_account_id,
          employeeId: a.employee_id,
          statementText: a.statement_text,
          accountName: a.account_name,
          bsb: a.bsb_number,
          accountNumber: a.account_number,
          dollarAmount: a.balance,
          isPrimary: a.is_primary_account,
          status: a.status,
          created_by: a.created_by,
          updated_by: a.updated_by,
          created_at: a.created_at,
          updated_at: a.updated_at,
          primary_account_key: a.primary_account_key,
        }));

        this.primaryAccount =
          normalizedAccounts.find((acc: any) => acc.isPrimary) || this.createEmptyAccount(true);

        this.bankAccounts = normalizedAccounts.filter((acc: any) => !acc.isPrimary);

        if (this.bankAccounts.length === 0) {
          this.bankAccounts.push(this.createEmptyAccount());
        }
      },
      error: (err) => console.error(err),
    });
  }

  addBankAccount() {
    if (this.bankAccounts.length < this.maxAccounts) {
      this.bankAccounts.push(this.createEmptyAccount());
    }
  }

  removeBankAccount(index: number) {
    this.bankAccounts.splice(index, 1);
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  updateBankAccount(account: any, isPrimary = false) {
    const now = new Date().toISOString();
    const payload = {
      statement_text: account.statementText,
      account_name: account.accountName,
      bsb_number: account.bsb,
      account_number: account.accountNumber,
      balance: account.dollarAmount,
      is_primary_account: isPrimary,
      status: isPrimary ? 'active' : 'inactive',
      updated_by: 1,
    };

    if (!account.accountNumber || !account.accountName) {
      this.snackBar.open('Account Number and Name are required.', 'Close', { duration: 3000 });
      return;
    }

    const setLoading = (loading: boolean) => {
      if (isPrimary) {
        this.isSavingPrimary = loading;
      } else {
        const key = account.bankAccountId || 'new-' + Math.random();
        this.savingBankAccounts[key] = loading;
      }
    };

    setLoading(true);

    const handleSuccess = (message: string) => {
      this.snackBar.open(message, 'Close', { duration: 3000 });
      this.loadBankAccounts(this.employeeId);
      setLoading(false);
    };

    const handleError = (err: any) => {
      console.error(err);
      const msg =
        err?.error?.errors?.account_number?.[0] || 'Something went wrong. Please try again.';
      this.snackBar.open(msg, 'Close', { duration: 4000 });
      setLoading(false);
    };

    if (account.bankAccountId) {
      this.payrollService.updateBankAccount(account.bankAccountId, payload).subscribe({
        next: () => handleSuccess('Account updated successfully!'),
        error: handleError,
      });
    } else {
      const createPayload = {
        ...payload,
        employee_id: this.employeeId,
        created_by: 1,
        created_at: now,
      };

      this.payrollService.createBankAccount(createPayload).subscribe({
        next: () => handleSuccess('Account created successfully!'),
        error: handleError,
      });
    }
  }
}

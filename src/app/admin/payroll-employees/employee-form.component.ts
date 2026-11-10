import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { AU_STATES } from '../sales/sales.labels';
import { toProblem } from '../sales/sales.service';
import { EmployeeFull, EmployeePayload } from './employees.models';
import { PayrollEmployeesService } from './employees.service';
import { isValidTfn } from './tfn';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html'
})
export class EmployeeFormComponent implements OnInit {
  id: number | null = null;
  loading = false;
  loadError = '';
  saving = false;
  banner = '';
  errors: Record<string, string> = {};
  states = AU_STATES;
  tfnLast3: string | null = null;
  superRate = 12;

  bases = ['Full-time', 'Part-time', 'Casual', 'Fixed-term'];
  frequencies = ['Weekly', 'Fortnightly', 'Monthly'];

  m = {
    first_name: '', middle_name: '', last_name: '', date_of_birth: '',
    email: '', mobile: '', address_line: '', suburb: '', state: '', postcode: '',
    job_title: '', employment_basis: 'Full-time', start_date: '',
    pay_frequency: 'Fortnightly', pay_basis: 'hourly' as 'hourly' | 'salary',
    hourly_rate: '', annual_salary: '', hours_per_week: '',
    tfn: '', residency: 'Australian resident',
    claim_tax_free_threshold: true, has_study_training_loans: false, working_holiday_maker: false,
    super_fund_name: '', super_usi: '', super_member_number: '',
    bank_account_name: '', bank_bsb: '', bank_account_number: ''
  };

  constructor(private api: PayrollEmployeesService, private route: ActivatedRoute, private router: Router, private alerts: AlertService) { }

  get editing(): boolean { return this.id !== null; }
  get foreign(): boolean { return this.m.residency === 'Foreign resident'; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.id = id ? +id : null;
    if (!this.id) return;
    this.loading = true;
    this.api.get(this.id).subscribe({
      next: e => { this.fill(e); this.loading = false; },
      error: err => { this.loading = false; this.loadError = toProblem(err).message; }
    });
  }

  private fill(e: EmployeeFull): void {
    this.superRate = e.super_rate;
    this.tfnLast3 = e.tax.tfn_last3;
    this.m = {
      first_name: e.first_name, middle_name: e.middle_name ?? '', last_name: e.last_name, date_of_birth: e.date_of_birth ?? '',
      email: e.email ?? '', mobile: e.mobile ?? '', address_line: e.address_line ?? '', suburb: e.suburb ?? '', state: e.state ?? '', postcode: e.postcode ?? '',
      job_title: e.job_title ?? '', employment_basis: e.employment_basis ?? 'Full-time', start_date: e.start_date ?? '',
      pay_frequency: e.pay_frequency ?? 'Fortnightly', pay_basis: (e.pay_basis ?? 'hourly') as 'hourly' | 'salary',
      hourly_rate: e.hourly_rate != null ? String(e.hourly_rate) : '', annual_salary: e.annual_salary != null ? String(e.annual_salary) : '',
      hours_per_week: e.hours_per_week != null ? String(e.hours_per_week) : '',
      tfn: '', residency: e.tax.residency,
      claim_tax_free_threshold: e.tax.claim_tax_free_threshold, has_study_training_loans: e.tax.has_study_training_loans, working_holiday_maker: e.tax.working_holiday_maker,
      super_fund_name: e.super?.fund_name ?? '', super_usi: e.super?.usi ?? '', super_member_number: e.super?.member_number ?? '',
      bank_account_name: e.bank?.account_name ?? '', bank_bsb: e.bank?.bsb ?? '', bank_account_number: e.bank?.account_number ?? ''
    };
  }

  onResidency(): void { if (this.foreign) this.m.claim_tax_free_threshold = false; }

  err(k: string): string { return this.errors[k] || ''; }

  private twoDp(v: string): boolean { return /^\d+(\.\d{1,2})?$/.test(v.trim()); }

  private validate(): boolean {
    const e: Record<string, string> = {};
    const m = this.m;
    if (!m.first_name.trim()) e['first_name'] = 'Enter a first name.';
    if (!m.last_name.trim()) e['last_name'] = 'Enter a last name.';
    if (m.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email.trim())) e['email'] = 'Enter a valid email address.';
    if (m.mobile.trim() && !/^[0-9 +()\-]{8,20}$/.test(m.mobile.trim())) e['mobile'] = 'Enter a valid phone number.';
    if (m.postcode.trim() && !/^\d{4}$/.test(m.postcode.trim())) e['postcode'] = 'Postcode must be 4 digits.';
    if (m.date_of_birth) {
      const d = new Date(m.date_of_birth); const min = new Date(); min.setFullYear(min.getFullYear() - 14);
      if (isNaN(+d) || d > min) e['date_of_birth'] = 'Employees must be at least 14 years old.';
    }
    if (!m.start_date) e['start_date'] = 'Enter the start date.';
    if (m.pay_basis === 'hourly') {
      if (!this.twoDp(m.hourly_rate) || +m.hourly_rate <= 0) e['hourly_rate'] = 'Enter the hourly rate, up to 2 decimal places.';
    } else if (!this.twoDp(m.annual_salary) || +m.annual_salary <= 0) e['annual_salary'] = 'Enter the yearly salary, up to 2 decimal places.';
    if (m.hours_per_week.trim() && (!this.twoDp(m.hours_per_week) || +m.hours_per_week <= 0 || +m.hours_per_week > 168)) e['hours_per_week'] = 'Enter hours between 0 and 168.';
    const tfn = m.tfn.replace(/\s+/g, '');
    if (tfn && !isValidTfn(tfn)) e['tfn'] = 'That tax file number does not look right. Check the 9 digits.';
    if (m.super_fund_name.trim()) {
      if (!/^[A-Za-z0-9]{9,14}$/.test(m.super_usi.replace(/\s+/g, ''))) e['super_usi'] = 'A USI is 9 to 14 letters and numbers.';
      if (!m.super_member_number.trim()) e['super_member_number'] = 'Enter the member number.';
    }
    const bankAny = m.bank_account_name.trim() || m.bank_bsb.trim() || m.bank_account_number.trim();
    if (bankAny) {
      if (!m.bank_account_name.trim()) e['bank_account_name'] = 'Enter the account name.';
      if (!/^\d{3}-?\d{3}$/.test(m.bank_bsb.replace(/\s+/g, ''))) e['bank_bsb'] = 'A BSB is 6 digits, like 062-000.';
      if (!/^\d{6,9}$/.test(m.bank_account_number.replace(/\s+/g, ''))) e['bank_account_number'] = 'An account number is 6 to 9 digits.';
    }
    this.errors = e;
    return Object.keys(e).length === 0;
  }

  private num(v: string): number | null { return v.trim() ? +v : null; }
  private txt(v: string): string | null { return v.trim() || null; }

  save(): void {
    this.banner = '';
    if (!this.validate()) { this.banner = 'Please fix the highlighted fields.'; this.scrollToError(); return; }
    const m = this.m;
    const body: EmployeePayload = {
      first_name: m.first_name.trim(), middle_name: this.txt(m.middle_name), last_name: m.last_name.trim(), date_of_birth: m.date_of_birth || null,
      email: this.txt(m.email), mobile: this.txt(m.mobile),
      address_line: this.txt(m.address_line), suburb: this.txt(m.suburb), state: m.state || null, postcode: this.txt(m.postcode),
      job_title: this.txt(m.job_title), employment_basis: m.employment_basis, start_date: m.start_date,
      pay_frequency: m.pay_frequency, pay_basis: m.pay_basis,
      hourly_rate: m.pay_basis === 'hourly' ? this.num(m.hourly_rate) : null,
      annual_salary: m.pay_basis === 'salary' ? this.num(m.annual_salary) : null,
      hours_per_week: this.num(m.hours_per_week),
      tfn: m.tfn.replace(/\s+/g, '') || null, residency: m.residency,
      claim_tax_free_threshold: this.foreign ? false : m.claim_tax_free_threshold,
      has_study_training_loans: m.has_study_training_loans, working_holiday_maker: m.working_holiday_maker,
      super_fund_name: this.txt(m.super_fund_name), super_usi: m.super_fund_name.trim() ? m.super_usi.replace(/\s+/g, '') : null,
      super_member_number: m.super_fund_name.trim() ? this.txt(m.super_member_number) : null,
      bank_account_name: this.txt(m.bank_account_name), bank_bsb: m.bank_bsb.replace(/\s+/g, '') || null, bank_account_number: m.bank_account_number.replace(/\s+/g, '') || null
    };
    this.saving = true;
    const call = this.id ? this.api.update(this.id, body) : this.api.create(body);
    call.subscribe({
      next: () => {
        this.saving = false;
        this.alerts.toast(this.id ? 'Employee updated' : 'Employee added');
        this.router.navigate(['/admin/payroll']);
      },
      error: e => {
        this.saving = false;
        const p = toProblem(e);
        this.errors = p.fieldErrors; this.banner = p.message;
        if (!Object.keys(p.fieldErrors).length) this.alerts.DangerSwalnew('Could not save', p.message); else this.scrollToError();
      }
    });
  }

  cancel(): void { this.router.navigate(['/admin/payroll']); }

  private scrollToError(): void {
    setTimeout(() => (document.querySelector('.cy-input.invalid') as HTMLElement | null)?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  }
}

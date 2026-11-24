import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { isValidAbn } from '../ui/abn';
import { CustomerPayload } from './sales.models';
import { SalesService, toProblem } from './sales.service';
import { AU_STATES } from './sales.labels';

type CType = CustomerPayload['type'];

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html'
})
export class CustomerFormComponent implements OnInit {
  id: number | null = null;
  loading = false;
  loadError = '';
  saving = false;
  submitted = false;
  banner = '';
  errors: Record<string, string> = {};
  states = AU_STATES;
  returnTo: string | null = null;

  types: { key: CType; label: string; hint: string }[] = [
    { key: 'Company', label: 'Business', hint: 'A company or organisation' },
    { key: 'Sole Trader', label: 'Sole trader', hint: 'One person trading under their own name' },
    { key: 'Individual', label: 'Individual', hint: 'A person, no ABN' },
  ];

  m = {
    type: 'Company' as CType, business_name: '', first_name: '', last_name: '', abn: '',
    email: '', phone: '', address_line: '', suburb: '', state: '', postcode: ''
  };

  constructor(private api: SalesService, private route: ActivatedRoute, private router: Router, private alerts: AlertService) { }

  get editing(): boolean { return this.id !== null; }
  get isBusiness(): boolean { return this.m.type === 'Company'; }
  get hasAbn(): boolean { return this.m.type !== 'Individual'; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.id = id ? +id : null;
    const rt = this.route.snapshot.queryParamMap.get('returnTo');
    this.returnTo = rt && rt.startsWith('/admin/') ? rt : null;
    if (this.id) {
      this.loading = true;
      this.api.customer(this.id).subscribe({
        next: c => {
          this.m = {
            type: c.type as CType, business_name: c.business_name ?? '', first_name: c.first_name ?? '', last_name: c.last_name ?? '',
            abn: c.abn ?? '', email: c.email ?? '', phone: c.phone ?? '', address_line: c.address_line ?? '',
            suburb: c.suburb ?? '', state: c.state ?? '', postcode: c.postcode ?? ''
          };
          this.loading = false;
        },
        error: e => { this.loading = false; this.loadError = toProblem(e).message; }
      });
    }
  }

  err(k: string): string { return this.errors[k] || ''; }

  private validate(): boolean {
    const e: Record<string, string> = {};
    const m = this.m;
    if (m.type === 'Company' && !m.business_name.trim()) e['business_name'] = 'Enter the business name.';
    if (m.type !== 'Company' && !m.first_name.trim()) e['first_name'] = 'Enter a first name.';
    if (this.hasAbn && m.abn.trim() && !isValidAbn(m.abn)) e['abn'] = 'Enter a valid 11-digit ABN.';
    if (m.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email.trim())) e['email'] = 'Enter a valid email address.';
    if (m.phone.trim() && !/^[0-9 +()\-]{8,20}$/.test(m.phone.trim())) e['phone'] = 'Enter a valid phone number.';
    if (m.postcode.trim() && !/^\d{4}$/.test(m.postcode.trim())) e['postcode'] = 'Postcode must be 4 digits.';
    this.errors = e;
    return Object.keys(e).length === 0;
  }

  save(): void {
    this.submitted = true; this.banner = '';
    if (!this.validate()) { this.banner = 'Please fix the highlighted fields.'; this.scrollToError(); return; }
    const m = this.m;
    const body: CustomerPayload = {
      type: m.type,
      business_name: m.business_name.trim() || null,
      first_name: m.first_name.trim() || null,
      last_name: m.last_name.trim() || null,
      abn: this.hasAbn ? (m.abn.replace(/\s+/g, '') || null) : null,
      email: m.email.trim() || null,
      phone: m.phone.trim() || null,
      address_line: m.address_line.trim() || null,
      suburb: m.suburb.trim() || null,
      state: m.state || null,
      postcode: m.postcode.trim() || null,
    };
    this.saving = true;
    const call = this.id ? this.api.updateCustomer(this.id, body) : this.api.createCustomer(body);
    call.subscribe({
      next: r => {
        this.saving = false;
        this.alerts.toast(r.message);
        if (this.returnTo) this.router.navigate([this.returnTo], { queryParams: { customer: r.data.id } });
        else this.router.navigate(['/admin/sales/customers']);
      },
      error: e => {
        this.saving = false;
        const p = toProblem(e);
        this.errors = p.fieldErrors; this.banner = p.message;
        if (!Object.keys(p.fieldErrors).length) this.alerts.DangerSwalnew('Could not save', p.message); else this.scrollToError();
      }
    });
  }

  cancel(): void { this.router.navigate([this.returnTo ?? '/admin/sales/customers']); }

  private scrollToError(): void {
    setTimeout(() => (document.querySelector('.cy-input.invalid') as HTMLElement | null)?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';
import { AlertService } from 'src/app/services/alert.service';
import { ClientBusiness, ClientBusinessService } from 'src/app/services/client-business.service';

@Component({
  selector: 'app-client-businesses',
  templateUrl: './client-businesses.component.html'
})
export class ClientBusinessesComponent implements OnInit {
  items: ClientBusiness[] = [];
  search = '';
  archived = false;
  loading = true;
  busy = false;

  constructor(
    private api: ClientBusinessService,
    private account: AccountService,
    private alerts: AlertService,
    private router: Router
  ) { }

  ngOnInit(): void { this.load(); }

  get shown(): ClientBusiness[] {
    const q = this.search.trim().toLowerCase();
    return q ? this.items.filter(i => i.company_name.toLowerCase().includes(q)) : this.items;
  }

  load(): void {
    this.loading = true;
    this.api.list(this.archived ? 'archived' : 'active').subscribe({
      next: r => { this.loading = false; this.items = r?.status ? r.data.companies : []; if (!r?.status) this.alerts.DangerSwalnew('Could not load your businesses', r?.message || 'Please try again.'); },
      error: e => { this.loading = false; this.alerts.DangerSwalnew('Could not load your businesses', e?.error?.message || 'Please try again.'); }
    });
  }

  toggleArchived(): void { this.archived = !this.archived; this.load(); }

  open(c: ClientBusiness): void {
    if (this.busy || this.archived) return;
    this.busy = true;
    this.account.selectCompany(c.company_id).subscribe({
      next: res => {
        this.busy = false;
        if (res.status) {
          localStorage.setItem('selected_company', JSON.stringify({ company_id: c.company_id, company_name: c.company_name, company_type: 'Client' }));
          this.router.navigate(['/admin/Dashboard']).then(() => window.location.reload());
        } else {
          this.alerts.DangerSwalnew('Could not open this business', res.message || 'Please try again.');
        }
      },
      error: e => { this.busy = false; this.alerts.DangerSwalnew('Could not open this business', e?.error?.message || 'Please try again.'); }
    });
  }

  edit(c: ClientBusiness): void { this.router.navigate(['/admin/companies', c.company_id, 'edit']); }

  toggle(c: ClientBusiness): void {
    this.api.toggle(c.company_id).subscribe({
      next: r => { if (r?.status) { this.items = this.items.filter(i => i.company_id !== c.company_id); } else { this.alerts.DangerSwalnew('Could not update', r?.message || 'Please try again.'); } },
      error: e => this.alerts.DangerSwalnew('Could not update', e?.error?.message || 'Please try again.')
    });
  }
}

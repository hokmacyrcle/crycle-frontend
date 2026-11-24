import { Component, OnInit } from '@angular/core';
import { SessionService } from 'src/app/core/session.service';
import { Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';
import { AlertService } from 'src/app/services/alert.service';
import { FirmOverdue, FirmOverdueClient } from '../sales/sales.models';
import { SalesService } from '../sales/sales.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  firstName = '';
  firmName = '';
  clients: any[] = [];
  opening = false;
  isClient = false;
  overdue: FirmOverdue | null = null;
  overdueError = false;
  openId: number | null = null;

  constructor(private router: Router, private api: AccountService, private alerts: AlertService, private sales: SalesService, session: SessionService) {
    let login: any = {};
    try { login = JSON.parse(localStorage.getItem('login_response') || '{}'); } catch { /* ignore */ }
    this.isClient = session.context === 'client';
    this.firstName = login?.data?.user?.first_name || '';
    const all: any[] = login?.data?.companies || [];
    this.clients = all.filter(c => c.company_type === 'Client');
    try { this.firmName = JSON.parse(localStorage.getItem('selected_company') || '{}')?.company_name || ''; } catch { /* ignore */ }
  }

  ngOnInit(): void {
    if (this.isClient) return;
    this.sales.firmOverdue().subscribe({
      next: r => { this.overdue = r.data; },
      error: () => { this.overdueError = true; }
    });
  }

  toggleClient(c: FirmOverdueClient): void { this.openId = this.openId === c.company_id ? null : c.company_id; }

  colour(i: number): string {
    return ['bg-cyrcle-cyan', 'bg-cyrcle-royal', 'bg-cyrcle-midnight', 'bg-cyrcle-navy'][i % 4];
  }

  openClient(c: any, url = '/admin/sales', status: string | null = null): void {
    this.opening = true;
    this.api.selectCompany(c.company_id).subscribe({
      next: res => {
        this.opening = false;
        if (res.status) {
          localStorage.setItem('selected_company', JSON.stringify({ company_id: c.company_id, company_name: c.company_name, company_type: 'Client' }));
          this.router.navigate([url], status ? { queryParams: { status } } : {}).then(() => window.location.reload());
        } else {
          this.alerts.DangerSwalnew('Could not open this business', res.message || 'Please try again.');
        }
      },
      error: e => { this.opening = false; this.alerts.DangerSwalnew('Could not open this business', e?.error?.message || 'Please try again.'); }
    });
  }
}

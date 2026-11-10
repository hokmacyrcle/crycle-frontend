import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  firstName = '';
  firmName = '';
  clients: any[] = [];
  opening = false;

  constructor(private router: Router, private api: AccountService, private alerts: AlertService) {
    let login: any = {};
    try { login = JSON.parse(localStorage.getItem('login_response') || '{}'); } catch { /* ignore */ }
    this.firstName = login?.data?.user?.first_name || '';
    const all: any[] = login?.data?.companies || [];
    this.clients = all.filter(c => c.company_type === 'Client');
    try { this.firmName = JSON.parse(localStorage.getItem('selected_company') || '{}')?.company_name || ''; } catch { /* ignore */ }
  }

  colour(i: number): string {
    return ['bg-cyrcle-cyan', 'bg-cyrcle-royal', 'bg-cyrcle-midnight', 'bg-cyrcle-navy'][i % 4];
  }

  openClient(c: any): void {
    this.opening = true;
    this.api.selectCompany(c.company_id).subscribe({
      next: res => {
        this.opening = false;
        if (res.status) {
          localStorage.setItem('selected_company', JSON.stringify(c));
          this.router.navigate(['/admin/sales']).then(() => window.location.reload());
        } else {
          this.alerts.DangerSwalnew('Could not open this business', res.message || 'Please try again.');
        }
      },
      error: e => { this.opening = false; this.alerts.DangerSwalnew('Could not open this business', e?.error?.message || 'Please try again.'); }
    });
  }
}

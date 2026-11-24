import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ClientBusiness {
  company_id: number;
  company_name: string;
  company_type: string;
  company_abn: string | null;
  company_acn: string | null;
  gst_registered: boolean;
  bank_account_name?: string | null;
  bank_bsb?: string | null;
  bank_account_number?: string | null;
  address_line: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class ClientBusinessService {
  private base = environment.apiUrl + '/companies';

  constructor(private http: HttpClient) { }

  private headers(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    return new HttpHeaders({ Authorization: `${tokenType} ${token}`, Accept: 'application/json' });
  }

  list(status: 'active' | 'archived' = 'active'): Observable<any> {
    return this.http.get(`${this.base}?status=${status}`, { headers: this.headers() });
  }
  get(id: number | string): Observable<any> {
    return this.http.get(`${this.base}/${id}`, { headers: this.headers() });
  }
  create(body: any): Observable<any> {
    return this.http.post(this.base, body, { headers: this.headers() }).pipe(tap(() => this.refreshSession()));
  }
  update(id: number | string, body: any): Observable<any> {
    return this.http.put(`${this.base}/${id}`, body, { headers: this.headers() }).pipe(tap(() => this.refreshSession()));
  }
  toggle(id: number | string): Observable<any> {
    return this.http.patch(`${this.base}/${id}/toggle-status`, {}, { headers: this.headers() }).pipe(tap(() => this.refreshSession()));
  }

  /** Keep the businesses saved at login (used by the picker and firm home) in step with the server. */
  refreshSession(): void {
    this.list('active').subscribe(res => {
      if (!res?.status) return;
      try {
        const login = JSON.parse(localStorage.getItem('login_response') || '{}');
        const all: any[] = login?.data?.companies || [];
        const firms = all.filter(c => c.company_type !== 'Client');
        const clients = (res.data.companies as ClientBusiness[]).map(c => ({
          company_id: c.company_id, company_name: c.company_name, company_type: c.company_type,
          company_abn: c.company_abn, company_acn: c.company_acn
        }));
        login.data = login.data || {};
        login.data.companies = [...firms, ...clients];
        localStorage.setItem('login_response', JSON.stringify(login));
      } catch { /* ignore */ }
    });
  }
}

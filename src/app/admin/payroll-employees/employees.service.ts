import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EmployeeFull, EmployeePayload, EmployeeRow, Meta } from './employees.models';

@Injectable({ providedIn: 'root' })
export class PayrollEmployeesService {
  private base = `${environment.apiUrl}/payroll/employees`;

  constructor(private http: HttpClient) { }

  private headers(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    const type = localStorage.getItem('token_type') || 'Bearer';
    return new HttpHeaders({ Authorization: `${type} ${token}`, Accept: 'application/json' });
  }

  list(opts: { status?: 'active' | 'archived'; search?: string; page?: number }):
    Observable<{ data: EmployeeRow[]; meta: Meta; counts: { active: number; archived: number } }> {
    let params = new HttpParams();
    if (opts.status) params = params.set('status', opts.status);
    if (opts.search) params = params.set('search', opts.search);
    if (opts.page) params = params.set('page', opts.page);
    return this.http.get<{ data: EmployeeRow[]; meta: Meta; counts: { active: number; archived: number } }>(this.base, { headers: this.headers(), params });
  }

  get(id: number | string): Observable<EmployeeFull> {
    return this.http.get<{ data: EmployeeFull }>(`${this.base}/${id}`, { headers: this.headers() }).pipe(map(r => r.data));
  }

  create(body: EmployeePayload): Observable<EmployeeFull> {
    return this.http.post<{ data: EmployeeFull }>(this.base, body, { headers: this.headers() }).pipe(map(r => r.data));
  }

  update(id: number, body: EmployeePayload): Observable<EmployeeFull> {
    return this.http.put<{ data: EmployeeFull }>(`${this.base}/${id}`, body, { headers: this.headers() }).pipe(map(r => r.data));
  }

  archive(id: number, archived: boolean): Observable<EmployeeFull> {
    return this.http.post<{ data: EmployeeFull }>(`${this.base}/${id}/archive`, { archived }, { headers: this.headers() }).pipe(map(r => r.data));
  }
}

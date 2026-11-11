import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface LeaveType { id: number; code: string; name: string; paid: boolean; accrual_hours: number | null; }
export interface LeaveEmployee { employee_id: number; name: string; casual: boolean; balances: Record<string, number>; }
export interface LeaveOverview { types: LeaveType[]; employees: LeaveEmployee[]; pending: number; }
export interface LeaveRequestRow {
  id: number; employee_id: number; employee_name: string; leave_type_id: number; type: string; paid: boolean;
  start_date: string; end_date: string; hours: number; status: 'pending' | 'approved' | 'declined'; note: string | null; to_pay: boolean;
}
export interface LeaveLedgerRow { id: number; date: string; type: string; kind: 'accrual' | 'taken' | 'adjustment'; hours: number; note: string | null; }
export interface NewLeaveRequest { employee_id: number; leave_type_id: number; start_date: string; end_date: string; hours?: number | null; note?: string | null; }

@Injectable({ providedIn: 'root' })
export class LeaveApiService {
  private base = `${environment.apiUrl}/payroll/leave`;
  constructor(private http: HttpClient) { }

  private headers(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    const type = localStorage.getItem('token_type') || 'Bearer';
    return new HttpHeaders({ Authorization: `${type} ${token}`, Accept: 'application/json' });
  }

  overview(): Observable<LeaveOverview> { return this.http.get<{ data: LeaveOverview }>(this.base, { headers: this.headers() }).pipe(map(r => r.data)); }
  saveType(id: number, accrualHours: number | null): Observable<LeaveOverview> {
    return this.http.put<{ data: LeaveOverview }>(`${this.base}/types/${id}`, { accrual_hours: accrualHours }, { headers: this.headers() }).pipe(map(r => r.data));
  }
  requests(): Observable<LeaveRequestRow[]> { return this.http.get<{ data: LeaveRequestRow[] }>(`${this.base}/requests`, { headers: this.headers() }).pipe(map(r => r.data)); }
  createRequest(body: NewLeaveRequest): Observable<LeaveRequestRow> { return this.http.post<{ data: LeaveRequestRow }>(`${this.base}/requests`, body, { headers: this.headers() }).pipe(map(r => r.data)); }
  approve(id: number, allowNegative = false): Observable<LeaveRequestRow> { return this.http.post<{ data: LeaveRequestRow }>(`${this.base}/requests/${id}/approve`, { allow_negative: allowNegative }, { headers: this.headers() }).pipe(map(r => r.data)); }
  decline(id: number): Observable<LeaveRequestRow> { return this.http.post<{ data: LeaveRequestRow }>(`${this.base}/requests/${id}/decline`, {}, { headers: this.headers() }).pipe(map(r => r.data)); }
  remove(id: number): Observable<unknown> { return this.http.delete(`${this.base}/requests/${id}`, { headers: this.headers() }); }
  adjust(body: { employee_id: number; leave_type_id: number; hours: number; note: string }): Observable<LeaveOverview> {
    return this.http.post<{ data: LeaveOverview }>(`${this.base}/adjustments`, body, { headers: this.headers() }).pipe(map(r => r.data));
  }
  ledger(employeeId: number): Observable<LeaveLedgerRow[]> { return this.http.get<{ data: LeaveLedgerRow[] }>(`${this.base}/employees/${employeeId}/ledger`, { headers: this.headers() }).pipe(map(r => r.data)); }
}

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Meta } from '../payroll-employees/employees.models';
import { CalcInput, CalcResult, History, NewItem, Overview, StpCheck, TimesheetWeekData, LineChange, NewPayRun, PayRunFull, PayRunRow, PayrollSettings } from './payrun.models';

@Injectable({ providedIn: 'root' })
export class PayRunService {
  private base = `${environment.apiUrl}/payroll/pay-runs`;

  constructor(private http: HttpClient) { }

  private headers(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    const type = localStorage.getItem('token_type') || 'Bearer';
    return new HttpHeaders({ Authorization: `${type} ${token}`, Accept: 'application/json' });
  }

  list(page = 1, status?: 'draft' | 'finalised'): Observable<{ data: PayRunRow[]; meta: Meta }> {
    let params = new HttpParams().set('page', page);
    if (status) params = params.set('status', status);
    return this.http.get<{ data: PayRunRow[]; meta: Meta }>(this.base, { headers: this.headers(), params });
  }

  get(id: number | string): Observable<PayRunFull> {
    return this.http.get<{ data: PayRunFull }>(`${this.base}/${id}`, { headers: this.headers() }).pipe(map(r => r.data));
  }

  create(body: NewPayRun): Observable<PayRunFull> {
    return this.http.post<{ data: PayRunFull }>(this.base, body, { headers: this.headers() }).pipe(map(r => r.data));
  }

  updateLine(id: number, lineId: number, body: LineChange): Observable<PayRunFull> {
    return this.http.put<{ data: PayRunFull }>(`${this.base}/${id}/lines/${lineId}`, body, { headers: this.headers() }).pipe(map(r => r.data));
  }

  addItem(id: number, lineId: number, body: NewItem): Observable<PayRunFull> {
    return this.http.post<{ data: PayRunFull }>(`${this.base}/${id}/lines/${lineId}/items`, body, { headers: this.headers() }).pipe(map(r => r.data));
  }

  stp(id: number): Observable<StpCheck> {
    return this.http.get<{ data: StpCheck }>(`${this.base}/${id}/stp`, { headers: this.headers() }).pipe(map(r => r.data));
  }

  addLeave(id: number, lineId: number, requestId: number): Observable<PayRunFull> {
    return this.http.post<{ data: PayRunFull }>(`${this.base}/${id}/lines/${lineId}/leave`, { request_id: requestId }, { headers: this.headers() }).pipe(map(r => r.data));
  }

  removeItem(id: number, lineId: number, itemId: number): Observable<PayRunFull> {
    return this.http.delete<{ data: PayRunFull }>(`${this.base}/${id}/lines/${lineId}/items/${itemId}`, { headers: this.headers() }).pipe(map(r => r.data));
  }

  removeLine(id: number, lineId: number): Observable<PayRunFull> {
    return this.http.delete<{ data: PayRunFull }>(`${this.base}/${id}/lines/${lineId}`, { headers: this.headers() }).pipe(map(r => r.data));
  }

  finalise(id: number): Observable<PayRunFull> {
    return this.http.post<{ data: PayRunFull }>(`${this.base}/${id}/finalise`, {}, { headers: this.headers() }).pipe(map(r => r.data));
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`, { headers: this.headers() });
  }

  calculate(body: CalcInput): Observable<CalcResult> {
    return this.http.post<{ data: CalcResult }>(`${environment.apiUrl}/payroll/calculator`, body, { headers: this.headers() }).pipe(map(r => r.data));
  }

  settings(): Observable<PayrollSettings> {
    return this.http.get<{ data: PayrollSettings }>(`${environment.apiUrl}/payroll/settings`, { headers: this.headers() }).pipe(map(r => r.data));
  }

  saveSettings(body: Pick<PayrollSettings, 'super_rate' | 'default_pay_frequency' | 'default_hours_per_week'>): Observable<PayrollSettings> {
    return this.http.put<{ data: PayrollSettings }>(`${environment.apiUrl}/payroll/settings`, body, { headers: this.headers() }).pipe(map(r => r.data));
  }

  history(fy?: number): Observable<History> {
    let params = new HttpParams();
    if (fy) params = params.set('fy', fy);
    return this.http.get<{ data: History }>(`${environment.apiUrl}/payroll/history`, { headers: this.headers(), params }).pipe(map(r => r.data));
  }

  overview(): Observable<Overview> {
    return this.http.get<{ data: Overview }>(`${environment.apiUrl}/payroll/overview`, { headers: this.headers() }).pipe(map(r => r.data));
  }

  setSuperPaid(id: number, paid: boolean): Observable<PayRunFull> {
    return this.http.post<{ data: PayRunFull }>(`${this.base}/${id}/super-paid`, { paid }, { headers: this.headers() }).pipe(map(r => r.data));
  }

  timesheets(week?: string): Observable<TimesheetWeekData> {
    let params = new HttpParams();
    if (week) params = params.set('week', week);
    return this.http.get<{ data: TimesheetWeekData }>(`${environment.apiUrl}/payroll/timesheets`, { headers: this.headers(), params }).pipe(map(r => r.data));
  }

  saveTimesheet(employeeId: number, weekStart: string, hours: Record<string, number | null>): Observable<TimesheetWeekData> {
    return this.http.put<{ data: TimesheetWeekData }>(`${environment.apiUrl}/payroll/timesheets/${employeeId}`, { week_start: weekStart, hours }, { headers: this.headers() }).pipe(map(r => r.data));
  }

  approveTimesheet(employeeId: number, weekStart: string, approved: boolean): Observable<TimesheetWeekData> {
    return this.http.post<{ data: TimesheetWeekData }>(`${environment.apiUrl}/payroll/timesheets/${employeeId}/approve`, { week_start: weekStart, approved }, { headers: this.headers() }).pipe(map(r => r.data));
  }

  refreshHours(id: number): Observable<{ data: PayRunFull; updated: number }> {
    return this.http.post<{ data: PayRunFull; updated: number }>(`${this.base}/${id}/refresh-hours`, {}, { headers: this.headers() });
  }
}

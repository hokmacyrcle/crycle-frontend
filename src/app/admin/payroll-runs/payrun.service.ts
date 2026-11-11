import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Meta } from '../payroll-employees/employees.models';
import { CalcInput, CalcResult, LineChange, NewPayRun, PayRunFull, PayRunRow } from './payrun.models';

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
}

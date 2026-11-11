import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AccountPayload, BankAccount, BankTxn, ColumnMap, ImportPreview, ImportResult, TxnPage, TxnStatus } from './banking.models';

@Injectable({ providedIn: 'root' })
export class BankingService {
  private base = `${environment.apiUrl}/banking`;

  constructor(private http: HttpClient) { }

  // No Content-Type here: the browser sets it (needed for file uploads).
  private headers(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    const type = localStorage.getItem('token_type') || 'Bearer';
    return new HttpHeaders({ Authorization: `${type} ${token}`, Accept: 'application/json' });
  }

  accounts(archived = false): Observable<BankAccount[]> {
    const params = new HttpParams().set('status', archived ? 'archived' : 'active');
    return this.http.get<{ data: BankAccount[] }>(`${this.base}/accounts`, { headers: this.headers(), params }).pipe(map(r => r.data));
  }
  addAccount(p: AccountPayload): Observable<{ data: BankAccount; message: string }> {
    return this.http.post<{ data: BankAccount; message: string }>(`${this.base}/accounts`, p, { headers: this.headers() });
  }
  updateAccount(id: number, p: AccountPayload): Observable<{ data: BankAccount; message: string }> {
    return this.http.put<{ data: BankAccount; message: string }>(`${this.base}/accounts/${id}`, p, { headers: this.headers() });
  }
  archiveAccount(id: number, archived: boolean): Observable<{ data: BankAccount; message: string }> {
    return this.http.post<{ data: BankAccount; message: string }>(`${this.base}/accounts/${id}/archive`, { archived }, { headers: this.headers() });
  }

  previewImport(id: number, file: File): Observable<ImportPreview> {
    const f = new FormData(); f.append('file', file);
    return this.http.post<{ data: ImportPreview }>(`${this.base}/accounts/${id}/import/preview`, f, { headers: this.headers() }).pipe(map(r => r.data));
  }
  runImport(id: number, file: File, mapping: ColumnMap, hasHeader: boolean, outflowPositive: boolean): Observable<{ data: ImportResult; message: string }> {
    const f = new FormData();
    f.append('file', file);
    f.append('mapping', JSON.stringify(mapping));
    f.append('has_header', hasHeader ? '1' : '0');
    f.append('outflow_positive', outflowPositive ? '1' : '0');
    return this.http.post<{ data: ImportResult; message: string }>(`${this.base}/accounts/${id}/import`, f, { headers: this.headers() });
  }
  undoImport(importId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/imports/${importId}`, { headers: this.headers() });
  }

  transactions(id: number, status: TxnStatus, search: string, page: number): Observable<TxnPage> {
    let params = new HttpParams().set('status', status).set('page', String(page));
    if (search) params = params.set('search', search);
    return this.http.get<TxnPage>(`${this.base}/accounts/${id}/transactions`, { headers: this.headers(), params });
  }
  setStatus(txnId: number, status: 'excluded' | 'review'): Observable<{ data: BankTxn; message: string }> {
    return this.http.post<{ data: BankTxn; message: string }>(`${this.base}/transactions/${txnId}/status`, { status }, { headers: this.headers() });
  }
}

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AccountPayload, AccountType, BankAccount, BankSummary, BankTxn, ColumnMap, FeedAccounts, FeedConnectResult, FeedStatus, Institution, ImportPreview, ImportResult, Receipt, ReceiptPage, ReceiptPayload, ChartAccount, ChartData, ChartPayload, ReconLines, ReconStart, TxnFilter, TxnPage, TxnStatus } from './banking.models';

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

  summary(): Observable<BankSummary> {
    return this.http.get<{ data: BankSummary }>(`${this.base}/summary`, { headers: this.headers() }).pipe(map(r => r.data));
  }

  /** Transactions of every account, or of one when accountId is given. */
  transactions(accountId: number | null, status: TxnStatus, f: TxnFilter, page: number): Observable<TxnPage> {
    let params = new HttpParams().set('status', status).set('page', String(page));
    if (accountId) params = params.set('account', String(accountId));
    if (f.search) params = params.set('search', f.search);
    if (f.from) params = params.set('from', f.from);
    if (f.to) params = params.set('to', f.to);
    if (f.type) params = params.set('type', f.type);
    return this.http.get<TxnPage>(`${this.base}/transactions`, { headers: this.headers(), params });
  }
  /** The table as a CSV file: same account, tab and filters as on screen. */
  exportTransactions(accountId: number | null, status: TxnStatus, f: TxnFilter): Observable<Blob> {
    let params = new HttpParams().set('status', status);
    if (accountId) params = params.set('account', String(accountId));
    if (f.search) params = params.set('search', f.search);
    if (f.from) params = params.set('from', f.from);
    if (f.to) params = params.set('to', f.to);
    if (f.type) params = params.set('type', f.type);
    return this.http.get(`${this.base}/transactions/export`, { headers: this.headers(), params, responseType: 'blob' });
  }
  bulkStatus(ids: number[], status: 'excluded' | 'review'): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/transactions/bulk-status`, { ids, status }, { headers: this.headers() });
  }
  setStatus(txnId: number, status: 'excluded' | 'review'): Observable<{ data: BankTxn; message: string }> {
    return this.http.post<{ data: BankTxn; message: string }>(`${this.base}/transactions/${txnId}/status`, { status }, { headers: this.headers() });
  }

  // Live bank connection (through the feed provider)
  feedStatus(): Observable<FeedStatus> {
    return this.http.get<{ data: FeedStatus }>(`${this.base}/feed/status`, { headers: this.headers() }).pipe(map(r => r.data));
  }
  institutions(q: string): Observable<Institution[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<{ data: Institution[] }>(`${this.base}/feed/institutions`, { headers: this.headers(), params }).pipe(map(r => r.data));
  }
  startFeed(inst: Institution, returnUrl: string): Observable<{ link_id: number; url: string | null }> {
    return this.http.post<{ data: { link_id: number; url: string | null } }>(`${this.base}/feed/start`,
      { institution_id: inst.id, institution_name: inst.name, return_url: returnUrl }, { headers: this.headers() }).pipe(map(r => r.data));
  }
  feedAccounts(linkId: number): Observable<FeedAccounts> {
    return this.http.get<{ data: FeedAccounts }>(`${this.base}/feed/links/${linkId}/accounts`, { headers: this.headers() }).pipe(map(r => r.data));
  }
  connectFeed(linkId: number, accounts: { ref: string; type: AccountType; name: string }[]): Observable<{ data: FeedConnectResult; message: string }> {
    return this.http.post<{ data: FeedConnectResult; message: string }>(`${this.base}/feed/links/${linkId}/connect`, { accounts }, { headers: this.headers() });
  }
  syncAccount(id: number): Observable<{ data: { imported: number }; message: string }> {
    return this.http.post<{ data: { imported: number }; message: string }>(`${this.base}/feed/accounts/${id}/sync`, {}, { headers: this.headers() });
  }
  disconnectFeed(linkId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/feed/links/${linkId}`, { headers: this.headers() });
  }

  // ---- Receipts ----
  receipts(search: string, page: number): Observable<ReceiptPage> {
    let params = new HttpParams().set('page', String(page));
    if (search) params = params.set('search', search);
    return this.http.get<ReceiptPage>(`${this.base}/receipts`, { headers: this.headers(), params });
  }
  uploadReceipts(files: File[]): Observable<{ data: Receipt[]; message: string }> {
    const f = new FormData();
    files.forEach(x => f.append('files[]', x));
    return this.http.post<{ data: Receipt[]; message: string }>(`${this.base}/receipts`, f, { headers: this.headers() });
  }
  updateReceipt(id: number, p: ReceiptPayload): Observable<{ data: Receipt; message: string }> {
    return this.http.put<{ data: Receipt; message: string }>(`${this.base}/receipts/${id}`, p, { headers: this.headers() });
  }
  deleteReceipt(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/receipts/${id}`, { headers: this.headers() });
  }
  receiptFile(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/receipts/${id}/file`, { headers: this.headers(), responseType: 'blob' });
  }

  // ---- Chart of accounts ----
  chart(): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.base}/chart-accounts`, { headers: this.headers() });
  }
  addChartAccount(p: ChartPayload): Observable<{ data: ChartAccount; message: string }> {
    return this.http.post<{ data: ChartAccount; message: string }>(`${this.base}/chart-accounts`, p, { headers: this.headers() });
  }
  updateChartAccount(id: number, p: ChartPayload): Observable<{ data: ChartAccount; message: string }> {
    return this.http.put<{ data: ChartAccount; message: string }>(`${this.base}/chart-accounts/${id}`, p, { headers: this.headers() });
  }
  archiveChartAccount(id: number, archived: boolean): Observable<{ data: ChartAccount; message: string }> {
    return this.http.post<{ data: ChartAccount; message: string }>(`${this.base}/chart-accounts/${id}/archive`, { archived }, { headers: this.headers() });
  }

  // ---- Reconcile ----
  reconStart(accountId: number): Observable<ReconStart> {
    return this.http.get<{ data: ReconStart }>(`${this.base}/reconcile/${accountId}`, { headers: this.headers() }).pipe(map(r => r.data));
  }
  reconLines(accountId: number, to: string): Observable<ReconLines> {
    const params = new HttpParams().set('to', to);
    return this.http.get<{ data: ReconLines }>(`${this.base}/reconcile/${accountId}/lines`, { headers: this.headers(), params }).pipe(map(r => r.data));
  }
  reconFinish(accountId: number, p: { statement_end: string; closing_balance: number; opening_balance: number | null; ids: number[] }): Observable<{ data: { id: number; line_count: number }; message: string }> {
    return this.http.post<{ data: { id: number; line_count: number }; message: string }>(`${this.base}/reconcile/${accountId}`, p, { headers: this.headers() });
  }
  reconUndo(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/reconcile/${id}`, { headers: this.headers() });
  }
}

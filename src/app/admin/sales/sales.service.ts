import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  BusinessInfo, CustomerFull, CustomerPayload, CustomerRow, Doc, DocKind, DocList, DocPayload, FirmOverdue, Meta, PickCustomer, RecurringRow, Summary
} from './sales.models';

export interface ApiProblem { message: string; fieldErrors: Record<string, string>; status: number; }

/** Turns a failed call into one message plus a field -> message map (Laravel 422 errors). */
export function toProblem(e: unknown): ApiProblem {
  const err = e as HttpErrorResponse;
  const body = err?.error ?? {};
  const fieldErrors: Record<string, string> = {};
  const raw = body?.errors;
  if (raw && typeof raw === 'object') {
    Object.keys(raw).forEach(k => { const v = raw[k]; fieldErrors[k] = Array.isArray(v) ? v[0] : String(v); });
  }
  let message = body?.message as string | undefined;
  if (!message) {
    message = err?.status === 0 ? 'Cannot reach the server. Check your internet connection and try again.'
      : err?.status === 401 ? 'Your session has ended. Please sign in again.'
      : err?.status === 403 ? 'You do not have access to this.'
      : err?.status >= 500 ? 'Something went wrong on our side. Please try again.'
      : 'Something went wrong. Please try again.';
  }
  return { message, fieldErrors, status: err?.status ?? 0 };
}

@Injectable({ providedIn: 'root' })
export class SalesService {
  private base = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) { }

  private headers(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    const type = localStorage.getItem('token_type') || 'Bearer';
    return new HttpHeaders({ Authorization: `${type} ${token}`, Accept: 'application/json' });
  }

  private path(kind: DocKind): string { return kind === 'invoice' ? 'invoices' : 'quotes'; }

  business(): Observable<BusinessInfo> {
    return this.http.get<{ data: BusinessInfo }>(`${this.base}/business`, { headers: this.headers() }).pipe(map(r => r.data));
  }

  summary(): Observable<Summary> {
    return this.http.get<{ data: Summary }>(`${this.base}/summary`, { headers: this.headers() }).pipe(map(r => r.data));
  }

  list(kind: DocKind, opts: { status?: string; search?: string; page?: number }): Observable<DocList> {
    let params = new HttpParams().set('per_page', 15);
    if (opts.status && opts.status !== 'all') params = params.set('status', opts.status);
    if (opts.search) params = params.set('search', opts.search);
    if (opts.page) params = params.set('page', opts.page);
    return this.http.get<DocList>(`${this.base}/${this.path(kind)}`, { headers: this.headers(), params });
  }

  get(kind: DocKind, id: number | string): Observable<Doc> {
    return this.http.get<{ data: Doc }>(`${this.base}/${this.path(kind)}/${id}`, { headers: this.headers() }).pipe(map(r => r.data));
  }

  create(kind: DocKind, body: DocPayload): Observable<{ data: Doc; message: string }> {
    return this.http.post<{ data: Doc; message: string }>(`${this.base}/${this.path(kind)}`, body, { headers: this.headers() });
  }

  update(kind: DocKind, id: number, body: DocPayload): Observable<{ data: Doc; message: string }> {
    return this.http.put<{ data: Doc; message: string }>(`${this.base}/${this.path(kind)}/${id}`, body, { headers: this.headers() });
  }

  remove(kind: DocKind, id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${this.path(kind)}/${id}`, { headers: this.headers() });
  }

  issueInvoice(id: number): Observable<{ data: Doc; message: string }> {
    return this.http.post<{ data: Doc; message: string }>(`${this.base}/invoices/${id}/issue`, {}, { headers: this.headers() });
  }

  voidInvoice(id: number): Observable<{ data: Doc; message: string }> {
    return this.http.post<{ data: Doc; message: string }>(`${this.base}/invoices/${id}/void`, {}, { headers: this.headers() });
  }

  addPayment(id: number, body: { amount: number; date: string; method: string; reference: string | null; notes: string | null }): Observable<{ data: Doc; message: string }> {
    return this.http.post<{ data: Doc; message: string }>(`${this.base}/invoices/${id}/payments`, body, { headers: this.headers() });
  }

  removePayment(id: number, paymentId: number): Observable<{ data: Doc; message: string }> {
    return this.http.delete<{ data: Doc; message: string }>(`${this.base}/invoices/${id}/payments/${paymentId}`, { headers: this.headers() });
  }

  firmOverdue(): Observable<{ data: FirmOverdue }> {
    return this.http.get<{ data: FirmOverdue }>(`${this.base}/firm/overdue`, { headers: this.headers() });
  }

  recurringList(): Observable<{ data: RecurringRow[] }> {
    return this.http.get<{ data: RecurringRow[] }>(`${this.base}/recurring-invoices`, { headers: this.headers() });
  }

  createRecurring(body: { invoice_id: number; frequency: string; end_date: string | null }): Observable<{ data: RecurringRow; message: string }> {
    return this.http.post<{ data: RecurringRow; message: string }>(`${this.base}/recurring-invoices`, body, { headers: this.headers() });
  }

  updateRecurring(id: number, body: { active?: boolean; frequency?: string; end_date?: string | null }): Observable<{ data: RecurringRow; message: string }> {
    return this.http.put<{ data: RecurringRow; message: string }>(`${this.base}/recurring-invoices/${id}`, body, { headers: this.headers() });
  }

  stopRecurring(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/recurring-invoices/${id}`, { headers: this.headers() });
  }

  setQuoteStatus(id: number, status: 'sent' | 'accepted' | 'declined'): Observable<{ data: Doc; message: string }> {
    return this.http.post<{ data: Doc; message: string }>(`${this.base}/quotes/${id}/status`, { status }, { headers: this.headers() });
  }

  convertQuote(id: number): Observable<{ data: { invoice_id: number; invoice_number: string }; message: string }> {
    return this.http.post<{ data: { invoice_id: number; invoice_number: string }; message: string }>(`${this.base}/quotes/${id}/convert`, {}, { headers: this.headers() });
  }

  // ---- customers
  customers(opts: { status?: 'active' | 'archived'; search?: string; page?: number }): Observable<{ data: CustomerRow[]; meta: Meta }> {
    let params = new HttpParams().set('per_page', 15);
    if (opts.status) params = params.set('status', opts.status);
    if (opts.search) params = params.set('search', opts.search);
    if (opts.page) params = params.set('page', opts.page);
    return this.http.get<{ data: CustomerRow[]; meta: Meta }>(`${this.base}/customers`, { headers: this.headers(), params });
  }

  customerPicker(): Observable<PickCustomer[]> {
    return this.http.get<{ data: PickCustomer[] }>(`${this.base}/customers`, { headers: this.headers(), params: new HttpParams().set('all', 1) }).pipe(map(r => r.data));
  }

  customer(id: number | string): Observable<CustomerFull> {
    return this.http.get<{ data: CustomerFull }>(`${this.base}/customers/${id}`, { headers: this.headers() }).pipe(map(r => r.data));
  }

  createCustomer(body: CustomerPayload): Observable<{ data: CustomerFull; message: string }> {
    return this.http.post<{ data: CustomerFull; message: string }>(`${this.base}/customers`, body, { headers: this.headers() });
  }

  updateCustomer(id: number, body: CustomerPayload): Observable<{ data: CustomerFull; message: string }> {
    return this.http.put<{ data: CustomerFull; message: string }>(`${this.base}/customers/${id}`, body, { headers: this.headers() });
  }

  archiveCustomer(id: number, archived: boolean): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/customers/${id}/archive`, { archived }, { headers: this.headers() });
  }
}

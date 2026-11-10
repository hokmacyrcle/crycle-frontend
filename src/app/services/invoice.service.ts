import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface invoices {
  id: number;
  invoice_date: string | Date;
  customer_name: string;
  total_amount: number | string;
  status: string;
  payment_status: string;
  due_date: string | Date;
  is_overdue: boolean;
}

export interface ApiSingleResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface ApiResponse<T> {
  status: boolean;
  status_code: number;
  message: string;
  data: {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    per_page: number;
    total: number;
  };
}

export interface DropdownData {
  contacts: { id: number; 'Contact Name': string }[];
  payment_terms: { id: number; text: string; description: string }[];
  items: { id: string; text: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    return new HttpHeaders({
      Authorization: `${tokenType} ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getinvoices(page: number = 1, perPage: number = 15, search: string = ''): Observable<ApiResponse<invoices>> {
    const url = `${environment.apiUrl}/invoices?page=${page}&per_page=${perPage}${search ? `&search=${search}` : ''}`;
    return this.http.get<ApiResponse<invoices>>(url, { headers: this.getAuthHeaders() });
  }

  createinvoices(invoices: Partial<invoices>): Observable<any> {
    return this.http.post(`${environment.apiUrl}/invoices`, invoices, { headers: this.getAuthHeaders() });
  }

  updateinvoice(id: number, invoices: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/invoices/${id}`, invoices, { headers: this.getAuthHeaders() });
  }

  deleteinvoices(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/invoices/${id}`, { headers: this.getAuthHeaders() });
  }

  toggleinvoicestatus(invoices_id: number): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/invoices/${invoices_id}/toggle-status`, {}, { headers: this.getAuthHeaders() });
  }
  saveInvoice(invoiceData: any): Observable<any> {
    const formData = new FormData();

    formData.append('company_id', invoiceData.company_id);
    formData.append('sent_to', invoiceData.sent_to);
    formData.append('invoice_date', invoiceData.invoice_date);
    formData.append('invoice_due_date', invoiceData.invoice_due_date);
    formData.append('terms', invoiceData.terms);

    // discount_type must be numeric
    formData.append('discount_type', invoiceData.discount_type === 'percent' ? '1' : '0');
    formData.append('discount_value', invoiceData.discount_value);

    formData.append('notes', invoiceData.notes || '');

    // Line items
    invoiceData.items.forEach((item: any, index: number) => {
      formData.append(`items[${index}][item_description]`, item.description);
      formData.append(`items[${index}][item_quantity]`, item.quantity.toString());
      formData.append(`items[${index}][item_rate]`, item.rate.toString());
      formData.append(`items[${index}][item_gst]`, item.gst ? item.gst.toString() : '0');
    });

    // Attachments
    if (invoiceData.attachments && invoiceData.attachments.length > 0) {
      invoiceData.attachments.forEach((file: File) => {
        formData.append('attachments[]', file);
      });
    }

    let headers = this.getAuthHeaders();
    headers = headers.delete('Content-Type'); // let browser set multipart boundary

    return this.http.post(`${environment.apiUrl}/invoices`, formData, {
      headers
    });
  }



  // saveInvoice(invoiceData: any): Observable<any> {
  //   return this.http.post(`${environment.apiUrl}/invoices`, invoiceData, {
  //     headers: this.getAuthHeaders()
  //   });
  // }


  getContactDetails(contactId: number): Observable<ApiSingleResponse<any>> {
    return this.http.get<ApiSingleResponse<any>>(`${environment.apiUrl}/dropdowns/contact-details/${contactId}`, {
      headers: this.getAuthHeaders()
    });
  }


  getInvoiceById(id: number): Observable<ApiSingleResponse<any>> {
    return this.http.get<ApiSingleResponse<any>>(`${environment.apiUrl}/invoices/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getProducts(companyId: number): Observable<any> {
    const url = `${environment.apiUrl}/dropdowns/contacts-by-company/${companyId}/items`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() });
  }
  getInvoiceTransactions(invoiceId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/invoices/${invoiceId}/transactions`, {
      headers: this.getAuthHeaders()
    });
  }

  recordPaymentWithAttachments(invoiceId: number, paymentData: any): Observable<any> {
    // Create FormData for multipart/form-data submission
    const formData = new FormData();

    // Add payment data
    formData.append('payment_amount', paymentData.payment_amount.toString());
    formData.append('payment_date', paymentData.payment_date);
    formData.append('payment_method', paymentData.payment_method);
    formData.append('reference_number', paymentData.reference_number || '');
    formData.append('notes', paymentData.notes || '');

    // Add file attachments if any
    if (paymentData.attachments && paymentData.attachments.length > 0) {
      paymentData.attachments.forEach((file: File) => {
        formData.append('attachments[]', file);
      });
    }

    // Get headers without Content-Type for FormData
    let headers = this.getAuthHeaders();
    headers = headers.delete('Content-Type'); // Let browser set the boundary

    return this.http.post(`${environment.apiUrl}/invoices/${invoiceId}/transactions`, formData, {
      headers: headers
    });
  }
  getDropdownData(companyId: number): Observable<any> {
    const url = `${environment.apiUrl}/dropdowns/contacts-by-company/${companyId}`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() });
  }
}
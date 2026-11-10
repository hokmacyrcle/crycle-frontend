import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Quote {
  quote_id: number;
  quote_date: string | Date;
  quote_number: string;
  contact_name: string;
  amount: string;
  formatted_amount: string;
  status: string;
  status_color: string;
  // Keep existing fields for backward compatibility
  id?: number;
  customer_name?: string;
  total_amount?: number | string;
  valid_until?: string | Date;
  reference_number?: string;
  company_name?: string;
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

export interface QuoteFilters {
  status?: string;
  date?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
  per_page?: number;
  page?: number;
}

export interface DropdownData {
  contacts: { id: number; 'Contact Name': string }[];
  payment_terms: { id: number; text: string; description: string }[];
  items: { id: string; text: string }[];
}

export interface Contact {
  id: number;
  'Contact Name': string;
}

export interface ContactDetails {
  id: number;
  email: string;
  billing_address: string;
  contact_name: string;
}

export interface PaymentTerm {
  id: number;
  text: string;
  description: string;
}

export interface Product {
  id: string;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuotesService {
  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    return new HttpHeaders({
      Authorization: `${tokenType} ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getQuotes(filters: QuoteFilters = {}): Observable<ApiResponse<Quote>> {
    let url = `${environment.apiUrl}/quotes?`;
    
    // Add filters to URL
    if (filters.status) url += `status=${filters.status}&`;
    if (filters.date) url += `date=${filters.date}&`;
    if (filters.search) url += `search=${filters.search}&`;
    if (filters.sort_by) url += `sort_by=${filters.sort_by}&`;
    if (filters.sort_order) url += `sort_order=${filters.sort_order}&`;
    if (filters.per_page) url += `per_page=${filters.per_page}&`;
    if (filters.page) url += `page=${filters.page}&`;
    
    // Remove trailing & if exists
    if (url.endsWith('&')) {
      url = url.slice(0, -1);
    }
    
    return this.http.get<ApiResponse<Quote>>(url, { headers: this.getAuthHeaders() });
  }

  getQuoteById(id: number): Observable<ApiSingleResponse<Quote>> {
    return this.http.get<ApiSingleResponse<Quote>>(`${environment.apiUrl}/quotes/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  createQuote(quoteData: any): Observable<any> {
    const formData = new FormData();
    
    // Add individual quote fields to match the API expectations
    formData.append('company_id', quoteData.company_id.toString());
    formData.append('contact_id', quoteData.contact_id.toString());
    formData.append('quote_date', quoteData.quote_date);
    formData.append('expiration_date', quoteData.expiration_date);
    
    // Add optional fields if they exist

    if (quoteData.discount_type) {
      formData.append('discount_type', quoteData.discount_type.toString());
    }
    if (quoteData.discount_method) {
      formData.append('discount_method', quoteData.discount_method);
    }
    if (quoteData.tax_rate !== undefined) {
      formData.append('tax_rate', quoteData.tax_rate.toString());
    }
    if (quoteData.notes) {
      formData.append('notes', quoteData.notes);
    }
    if (quoteData.terms) {
      formData.append('terms', quoteData.terms);
    }
    
    // Add line items as individual form fields
    if (quoteData.items && quoteData.items.length > 0) {
      quoteData.items.forEach((item: any, index: number) => {
        formData.append(`items[${index}][item_description]`, item.item_description);
        formData.append(`items[${index}][item_quantity]`, item.item_quantity.toString());
        formData.append(`items[${index}][item_rate]`, item.item_rate.toString());
        if (item.item_gst_rate !== undefined) {
          formData.append(`items[${index}][item_gst_rate]`, item.item_gst_rate);
        }
      });
    }
    
    // Create headers without Content-Type for multipart/form-data
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`
      // Note: Don't set Content-Type for FormData, let browser set it automatically
    });
    
    return this.http.post(`${environment.apiUrl}/quotes`, formData, {
      headers: headers
    });
  }

  createQuoteWithAttachments(quoteData: any, attachments?: File[]): Observable<any> {
    const formData = new FormData();
    
    // Add individual quote fields to match the API expectations
    formData.append('company_id', quoteData.company_id.toString());
    formData.append('contact_id', quoteData.contact_id.toString());
    formData.append('quote_date', quoteData.quote_date);
    formData.append('expiration_date', quoteData.expiration_date);
    
    // Add optional fields if they exist

    if (quoteData.discount_type) {
      formData.append('discount_type', quoteData.discount_type.toString());
    }
    if (quoteData.discount_method) {
      formData.append('discount_method', quoteData.discount_method);
    }
    if (quoteData.tax_rate !== undefined) {
      formData.append('tax_rate', quoteData.tax_rate.toString());
    }
    if (quoteData.notes) {
      formData.append('notes', quoteData.notes);
    }
    if (quoteData.terms) {
      formData.append('terms', quoteData.terms);
    }
    
    // Add line items as individual form fields
    if (quoteData.items && quoteData.items.length > 0) {
      quoteData.items.forEach((item: any, index: number) => {
        formData.append(`items[${index}][item_description]`, item.item_description);
        formData.append(`items[${index}][item_quantity]`, item.item_quantity.toString());
        formData.append(`items[${index}][item_rate]`, item.item_rate.toString());
        if (item.item_gst_rate !== undefined) {
          formData.append(`items[${index}][item_gst_rate]`, item.item_gst_rate.toString());
        }
      });
    }
    
    // Add attachment files if provided
    if (attachments && attachments.length > 0) {
      attachments.forEach((file, index) => {
        formData.append(`attachments[]`, file, file.name);
      });
    }
    
    // Create headers without Content-Type for multipart/form-data
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`
      // Note: Don't set Content-Type for FormData, let browser set it automatically
    });
    
    return this.http.post(`${environment.apiUrl}/quotes`, formData, {
      headers: headers
    });
  }

  updateQuote(id: number, quoteData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/quotes/${id}`, quoteData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteQuote(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/quotes/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  toggleQuoteStatus(quoteId: number): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/quotes/${quoteId}/toggle-status`, {}, { 
      headers: this.getAuthHeaders() 
    });
  }

  convertQuoteToInvoice(quoteId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/quotes/${quoteId}/convert-to-invoice`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  updateQuoteStatus(quoteId: number, status: string): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/quotes/${quoteId}/status`, { status }, {
      headers: this.getAuthHeaders()
    });
  }

  getDropdownData(companyId: number): Observable<any> {
    const url = `${environment.apiUrl}/dropdowns/contacts-by-company/${companyId}`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() });
  }

  getProducts(companyId: number): Observable<any> {
    const url = `${environment.apiUrl}/dropdowns/contacts-by-company/${companyId}/items`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() });
  }

  getContactDetails(contactId: number): Observable<any> {
    const url = `${environment.apiUrl}/dropdowns/contact-details/${contactId}`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() });
  }
}

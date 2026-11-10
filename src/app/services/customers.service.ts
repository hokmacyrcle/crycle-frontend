import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
// Define the Contact interface based on API response
export interface Contact {
  id: number;
  name: string;
  type: string;
  email: string;
  phone: string;
  mobile: string;
  company: {
    id: number;
    name: string;
  };
  address: string;
  category: string;
  status: string;
  subscriber_client: boolean;
  created_at: any;
  updated_at: any;
}
export interface addContact {
  company_id: number;
  contact_type: string;
  contact_first_name: string;
  contact_middle_name?: string;
  contact_last_name: string;
  contact_company_name?: string;
  contact_phone_number?: string;
  contact_mobile_number?: string;
  contact_email_address: string;
  contact_address_line_1?: string;
  contact_address_line_2?: string;
  contact_address_line_3?: string;
  contact_city?: string;
  contact_state?: string;
  contact_post_code?: string;
  contact_country?: string;
  contact_category: string;
  contact_status: string;
  subscriber_client: boolean;
  subscriber_id?: number;
}
export interface ApiResponse1 {
  success: boolean;
  data: {
    contacts?: Contact[];
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
    };
    contact?: Contact; // For single contact responses
  };
  message: string;
}
// Define the API response structure for Contacts
export interface ApiResponse {
  success: boolean;
  data: {
    contacts: Contact[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
    };
  };
  message: string;
}
@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  constructor(private http: HttpClient) { }

  // Get all contacts
  getContacts(page: number = 1, perPage: number = 15, search: string = ''): Observable<ApiResponse> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`
    });

    const url = `${environment.apiUrl}/contacts?page=${page}&per_page=${perPage}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
    return this.http.get<any>(url, { headers });
  }

  // Get contact by id
  getContactById(id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`
    });

    const url = `${environment.apiUrl}/contacts/${id}`;
    return this.http.get<any>(url, { headers });
  }

  // Update contact
 updateContact(id: number, contactData: Partial<Contact>): Observable<ApiResponse> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`,
      'Content-Type': 'application/json'
    });

    const url = `${environment.apiUrl}/contacts/${id}`;
    return this.http.put<ApiResponse>(url, contactData, { headers });
  }

  // Delete contact
  deleteContact(id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`,
    });

    const url = `${environment.apiUrl}/contacts/${id}`;
    return this.http.delete<any>(url, { headers });
  }

  // Toggle contact status
  toggleContactStatus(id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`,
      'Content-Type': 'application/json'
    });

    const url = `${environment.apiUrl}/contacts/${id}/toggle-status`;
    return this.http.patch<any>(url, {}, { headers });
  }

  // Create a new contact
 createContact(contactData: Partial<Contact>): Observable<ApiResponse> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`,
      'Content-Type': 'application/json'
    });

    const url = `${environment.apiUrl}/contacts`;
    return this.http.post<ApiResponse>(url, contactData, { headers });
  }
}
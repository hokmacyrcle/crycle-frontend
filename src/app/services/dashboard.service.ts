import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// Define the Client interface based on API response
export interface Client {
  id: number;
  company_name: string;
  phone: string;
  website: string;
  vat_number: string;
  gst_number: string;
  address: string;
  email: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Define the API response structure
export interface ApiResponse {
  status: boolean;
  status_code: number;
  message: string;
  data: {
    current_page: number;
    data: Client[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) { }

  //  get all clients
  getClients(page: number = 1, perPage: number = 15, search: string = ''): Observable<ApiResponse> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`
    });

    const url = `${environment.apiUrl}/clients?page=${page}&per_page=${perPage}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
    return this.http.get<ApiResponse>(url, { headers });
  }
  // get client by id 
  getClientById(id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`
    });

    const url = `${environment.apiUrl}/clients/${id}`;
    return this.http.get<any>(url, { headers });
  }

  // UPDATE CLIENT 
  updateClient(id: number, clientData: Partial<Client>): Observable<any> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`,
      'Content-Type': 'application/json'
    });

    const url = `${environment.apiUrl}/clients/${id}`;
    return this.http.put<any>(url, clientData, { headers });
  }
  // delete client
  deleteClient(id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`,
    });

    const url = `${environment.apiUrl}/clients/${id}`;
    return this.http.delete<any>(url, { headers });
  }
  // toggle status update 
  toggleClientStatus(id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`,
      'Content-Type': 'application/json'
    });

    const url = `${environment.apiUrl}/clients/${id}/toggle-status`;
    return this.http.patch<any>(url, {}, { headers });
  }
  // create client 
  createClient(clientData: Partial<Client>): Observable<any> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';

    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`,
      'Content-Type': 'application/json'
    });

    const url = `${environment.apiUrl}/clients`; // Assuming this is correct
    return this.http.post<any>(url, clientData, { headers });
  }

}
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
// Define the Company interface based on API response
export interface Company {
  company_id: number;
  company_name: string;
  company_abn: string;
  company_acn: string;
  gst_registered: boolean;
  gst_number: string | null;
  gst_registration_start_date: string | null;
  company_registration_date: string;
  company_type: string;
  locations: Location[];
  created_at: string;
  updated_at: string;
}

// Define Location interface
export interface Location {
  location_id: number;
  company_id: number;
  address_line_1: string;
  address_line_2: string;
  address_line_3: string | null;
  city: string;
  state: string;
  postcode: string;
  country: string;
  location_status: string;
  created_at: string;
  updated_at: string;
}

// Define the API response structure for Companies
export interface ApiResponse {
  status: boolean;
  status_code: number;
  message: string;
  data: {
    current_page: number;
    data: Company[];
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
export class CompaniesService {
constructor(private http: HttpClient) { }

  // Get all companies
  getCompanies(page: number = 1, perPage: number = 15, search: string = ''): Observable<ApiResponse> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`
    });

    const url = `${environment.apiUrl}/companies?page=${page}&per_page=${perPage}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
    return this.http.get<ApiResponse>(url, { headers });
  }

  // Get company by id
  getCompanyById(id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`
    });

    const url = `${environment.apiUrl}/companies/${id}`;
    return this.http.get<any>(url, { headers });
  }

  // Update company
  updateCompany(id: number, companyData: Partial<Company>): Observable<any> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`,
      'Content-Type': 'application/json'
    });

    const url = `${environment.apiUrl}/companies/${id}`;
    return this.http.put<any>(url, companyData, { headers });
  }

  // Delete company
  deleteCompany(id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`,
    });

    const url = `${environment.apiUrl}/companies/${id}`;
    return this.http.delete<any>(url, { headers });
  }

  // Toggle company status
  toggleCompanyStatus(id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`,
      'Content-Type': 'application/json'
    });

    const url = `${environment.apiUrl}/companies/${id}/toggle-status`;
    return this.http.patch<any>(url, {}, { headers });
  }

  // Create a new company
  createCompany(companyData: Partial<Company>): Observable<any> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';

    const headers = new HttpHeaders({
      Authorization: `${tokenType} ${token}`,
      'Content-Type': 'application/json'
    });

    const url = `${environment.apiUrl}/companies`; // Assuming this is correct
    return this.http.post<any>(url, companyData, { headers });
  }

}

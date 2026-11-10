import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
export interface Employee {
  emp_id: number,
  emp_first_name: string,
  emp_middle_name: string,
  emp_last_name: string,
  emp_gender: string,
  emp_email_address: string,
  emp_phone_number: string,
  emp_mobile_number: string,
  emp_company_id: number,
  emp_status: string,
  emp_designation_id: any,
  emp_start_date: string,
  emp_resignation_date: any,
  emp_last_working_date: any,
  emp_termination_date: any,
  emp_contract_end_date: any,
  emp_tfn: string,
  emp_work_authorization: string,
  emp_visa_subclass?: string,
  emp_visa_expiry_date?: string,
  emp_employment_type: string,
  emp_address_line_1: string,
  emp_address_line_2: string,
  emp_address_line_3: any,
  emp_city: string,
  emp_state: string,
  emp_post_code: string,
  emp_country: string,
  created_at: string,
  updated_at: string,
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

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    return new HttpHeaders({
      Authorization: `${tokenType} ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getEmployees(page: number = 1, perPage: number = 15, search: string = ''): Observable<ApiResponse<Employee>> {
    const url = `${environment.apiUrl}/employees?page=${page}&per_page=${perPage}${search ? `&search=${search}` : ''}`;
    return this.http.get<ApiResponse<Employee>>(url, { headers: this.getAuthHeaders() });
  }

  createEmployee(employee: Partial<Employee>): Observable<any> {
    return this.http.post(`${environment.apiUrl}/employees`, employee, { headers: this.getAuthHeaders() });
  }

  updateEmployee(id: number, employee: Partial<Employee>): Observable<any> {
    return this.http.put(`${environment.apiUrl}/employees/${id}`, employee, { headers: this.getAuthHeaders() });
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/employees/${id}`, { headers: this.getAuthHeaders() });
  }

  toggleEmployeeStatus(employee_id: number): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/employees/${employee_id}/toggle-status`, {}, { headers: this.getAuthHeaders() });
  }


getEmployeeById(id: number): Observable<ApiSingleResponse<Employee>> {
  return this.http.get<ApiSingleResponse<Employee>>(`${environment.apiUrl}/employees/${id}`, {
    headers: this.getAuthHeaders()
  });
}


}

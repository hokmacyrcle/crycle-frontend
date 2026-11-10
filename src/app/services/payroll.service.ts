import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

/* 
 Employee Interface
*/
export interface Employees {
  employee_id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  calendar: string;
  employee_group: string;
  next_payment_date: string;
  action_required: string | null;

  //--------
  selected?: boolean;
  start_date: string;
  emp_company_id: number;
  superannuation_memberships?: { fund_name: string; member_number: string }[];
}
export interface Tax {
  employee_id: number;
  tax_file_number: string;
  tfn_exemption: string;
  residency_status: string;
  has_approved_withholding_variation: string;
  tax_scale_type: string;
  has_study_training_loans: string;
  claim_tax_free_threshold: string;
  other_tax_offset_claimed: string;
  tax_offset_amount: string;
  increase_tax_withheld: string;
  additional_tax_withheld: string;
  eligible_for_leave_loading: string;
  tax_notes: string;

  variation_reason?: string;
  increase_tax_withheld_amount?: string;
  leave_loading_percentage?: string;
}


/* 
 API Response Interfaces
*/
export interface ApiSingleResponse<T> {
  status: boolean;
  success?: boolean;
  message: string;
  data: T;
  errors?: { [key: string]: string[] };
}

export interface ApiResponse<T> {
  status: boolean;
  status_code: number;
  message: string;
  data: {
    current_page: number;
    data: T[];
    total: number;
    per_page: number;
    last_page: number;
  };
}

export interface SuperannuationMembership {
  fund_name: string;
  member_number: string;
  fund_code?: string;
}

export interface EmployeeContractInformation {
  employee_id: number;
  employment_type: string;
  income_type: string;
  employment_basis: string;
  start_date: string; // in 'YYYY-MM-DD' format
  classification?: string;
  pay_frequency: string;
  employee_group?: string;
  holiday_group?: string;
  include_holidays_in_payslips: boolean;
  ordinary_earnings_rate: string;
  authorised_to_approve_leave: boolean;
  authorised_to_approve_timesheets: boolean;
  authorised_fields?: string;
  superannuation_memberships: SuperannuationMembership[];
  notes?: string;

  // Additional fields (optional)
  emp_first_name?: string;
  emp_last_name?: string;
  emp_company_id?: number;
}
export interface BankAccount {
  bank_account_id?: number;
  employee_id: number;
  statement_text: string;
  account_name: string;
  bsb_number: string;
  account_number: string;
  balance: string;
  is_primary_account: boolean;
  status: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  primary_account_key?: string | null;
}
export interface EmployeePayrollDetailsModel {
  emp_id?: number;
  emp_title?: string;
  emp_first_name: string;
  emp_middle_name?: string;
  emp_last_name: string;
  emp_date_of_birth?: string; // ISO string
  emp_job_title?: string;
  emp_address_search?: string;
  emp_xero_me_invitation?: boolean;
  profile_pic?: File | string; // Either a File to upload or a URL string
  emp_emergency_contact_name?: string;
  emp_emergency_contact_relationship?: string;
  emp_emergency_contact_phone?: string;
  emp_emergency_contact_email?: string;
  emp_gender?: string;
  emp_email_address?: string;
  emp_phone_number?: string;
  emp_mobile_number?: string;
  emp_company_id: number;
  emp_status?: string;
  emp_designation_id?: number;
  emp_start_date?: string;
  emp_resignation_date?: string;
  emp_last_working_date?: string;
  emp_termination_date?: string;
  emp_contract_end_date?: string;
  emp_tfn?: string;
  emp_work_authorization?: string;
  emp_visa_subclass?: string;
  emp_visa_expiry_date?: string;
  emp_employment_type?: string;
  emp_address_line_1?: string;
  emp_address_line_2?: string;
  emp_address_line_3?: string;
  emp_city?: string;
  emp_state?: string;
  emp_post_code?: string;
  emp_country?: string;
  created_at?: string;
  updated_at?: string;
  employee_id?: number;
}


// timesheet.model.ts
export interface Timesheet {
  id: number;
  employee_id: number;
  period: string;
  hours_worked: number;
  // add other fields based on your API response
}
/*
 Payroll Service
*/
@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  // Get paginated employees
  getEmployees(page: number = 1, perPage: number = 15): Observable<ApiResponse<Employees>> {
    const url = `${environment.apiUrl}/employees?page=${page}&per_page=${perPage}`;
    return this.http.get<ApiResponse<Employees>>(url, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('API Error (getEmployees):', error);
        return throwError(() => error);
      })
    );
  }


  getEmployeeById(id: number): Observable<ApiSingleResponse<EmployeePayrollDetailsModel>> {
    const url = `${environment.apiUrl}/employees/${id}`;
    return this.http.get<ApiSingleResponse<EmployeePayrollDetailsModel>>(url, { headers: this.getAuthHeaders() })
      .pipe(catchError((error) => {
        console.error('API Error (getEmployeeById):', error);
        return throwError(() => error);
      }));
  }


  putEmployee(id: number, employeeData: Partial<EmployeePayrollDetailsModel> | FormData): Observable<ApiSingleResponse<EmployeePayrollDetailsModel>> {
    const url = `${environment.apiUrl}/employees/${id}`;

    let headers = this.getAuthHeaders();

    // If FormData, remove content-type header if exists
    if (employeeData instanceof FormData) {
      // Clone headers excluding 'Content-Type'
      headers = headers.delete('Content-Type');
    }

    return this.http.put<ApiSingleResponse<EmployeePayrollDetailsModel>>(url, employeeData, { headers })
      .pipe(catchError((error) => {
        console.error('API Error (putEmployee):', error);
        return throwError(() => error);
      }));
  }



  postEmployee(employeeData: Partial<EmployeePayrollDetailsModel>): Observable<ApiSingleResponse<EmployeePayrollDetailsModel>> {
    const url = `${environment.apiUrl}/employees`;
    return this.http.post<ApiSingleResponse<EmployeePayrollDetailsModel>>(url, employeeData, { headers: this.getAuthHeaders() })
      .pipe(catchError((error) => {
        console.error('API Error (postEmployee):', error);
        return throwError(() => error);
      }));
  }

  createEmployeeTax(employeeData: Partial<Tax>): Observable<ApiSingleResponse<Tax>> {
    const url = `${environment.apiUrl}/tax-details`;
    return this.http.post<ApiSingleResponse<Tax>>(url, employeeData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('API Error (createEmployeeTax):', error);
        return throwError(() => error);
      })
    );
  }



  getEmployeecontractinformation(id: number): Observable<ApiSingleResponse<Employees>> {
    const url = `${environment.apiUrl}/update-employee-contract-information/${id}`;
    return this.http.get<ApiSingleResponse<Employees>>(url, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('API Error (getEmployeeById):', error);
        return throwError(() => error);
      })
    );
  }
  getEmployeeDropdowns(): Observable<any> {
    const url = `${environment.apiUrl}/employee-dropdown`;
    return this.http.get<any>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('API Error (getEmployeeDropdowns):', error);
        return throwError(() => error);
      })
    );
  }
  // payroll.service.ts
  putEmployeeContractInformation(contractData: EmployeeContractInformation
  ): Observable<ApiSingleResponse<EmployeeContractInformation>> {
    const url = `${environment.apiUrl}/update-employee-contract-information`;
    return this.http.post<ApiSingleResponse<EmployeeContractInformation>>(url, contractData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('API Error (putEmployeeContractInformation):', error);
        return throwError(() => error);
      })
    );
  }


  getBankAccountsByEmployeeId(id: number): Observable<any> {
    const url = `${environment.apiUrl}/bank-accounts/${id}`;
    return this.http.get(url, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching bank accounts:', error);
        return throwError(() => error);
      })
    );
  }


  updateBankAccounts(payload: any): Observable<any> {
    const url = `${environment.apiUrl}/bank-accounts`;
    return this.http.post(url, payload, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Error updating bank accounts:', error);
        return throwError(() => error);
      })
    );
  }

  createBankAccount(payload: any): Observable<any> {
    const url = `${environment.apiUrl}/bank-accounts`;
    return this.http.post(url, payload, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Error creating bank account:', error);
        return throwError(() => error);
      })
    );
  }

  updateBankAccount(id: number, payload: any): Observable<any> {
    const url = `${environment.apiUrl}/bank-accounts/${id}`;
    return this.http.put(url, payload, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error(`Error updating bank account with ID ${id}:`, error);
        return throwError(() => error);
      })
    );
  }


  getEmployeeTaxId(id: number): Observable<any> {
    const url = `${environment.apiUrl}/tax-details/${id}`;
    return this.http.get(url, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('API Error (getEmployeeTaxId):', error);
        return throwError(() => error);
      })
    );
  }

  // Update employee tax information
  updateEmployeeTax(
    id: number,
    employeeData: Partial<Tax>
  ): Observable<ApiSingleResponse<Tax>> {
    const url = `${environment.apiUrl}/tax-details/${id}`;
    return this.http.put<ApiSingleResponse<Tax>>(url, employeeData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('API Error (updateEmployeeTax):', error);
        return throwError(() => error);
      })
    );
  }


  // leave type
  getLeaveTypeDropdowns(): Observable<any[]> {
    const url = `${environment.apiUrl}/leave-type-dropdowns`;
    return this.http.get<any[]>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('API Error (getLeaveTypeDropdowns):', error);
        return throwError(() => error);
      })
    );
  }

  // post assign leave  

  assignLeaveType(payload: any) {
    const url = `${environment.apiUrl}/assign-leave-type`;
    return this.http.post(url, payload, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Error assigning leave type:', error);
        return throwError(() => error);
      })
    );
  }


  // /employees/{employeeId}/assign-leave-types

  getLeaveBalancesByEmployeeId(id: number): Observable<{ success: boolean; data: { type: string; balance_hours: number; opening_hours: number; }[] }> {
    const url = `${environment.apiUrl}/employees/${id}/leave-balances`; // dynamically use id
    return this.http.get<{ success: boolean; data: any[] }>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('API Error (getLeaveBalancesByEmployeeId):', error);
        return throwError(() => error);
      })
    );
  }

  createLeaveRequest(payload: any): Observable<any> {
    const url = `${environment.apiUrl}/leave-requests`;
    return this.http.post(url, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('API Error (createLeaveRequest):', error);
        return throwError(() => error);
      })
    );
  }


  // leave type
  geTimeperiodDropdowns(): Observable<any[]> {
    const url = `${environment.apiUrl}/timesheets/week-endings`;
    return this.http.get<any[]>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('API Error (geTimeperiodDropdowns):', error);
        return throwError(() => error);
      })
    );
  }
  getEmployeesfordropdown(): Observable<ApiResponse<Employees>> {
    const url = `${environment.apiUrl}/employees`;
    return this.http.get<ApiResponse<Employees>>(url, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('API Error (getEmployees):', error);
        return throwError(() => error);
      })
    );
  }
  createtimesheet(): Observable<any[]> {
    const url = `${environment.apiUrl}/timesheets`;
    return this.http.get<any[]>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('API Error (geTimeperiodDropdowns):', error);
        return throwError(() => error);
      })
    );
  }

  getTimesheets(employeeId: number, period: string): Observable<ApiResponse<Timesheet>> {
  const url = `${environment.apiUrl}/timesheets`;

  const body = {
    employee_id: employeeId,
    period: period
  };

  return this.http.post<ApiResponse<Timesheet>>(url, body, { headers: this.getAuthHeaders() }).pipe(
    catchError((error) => {
      console.error('API Error (getTimesheets):', error);
      return throwError(() => error);
    })
  );
}


}



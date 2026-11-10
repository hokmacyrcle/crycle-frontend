import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';

const baseUrl = environment.apiUrl;

interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_code: string;
  password: string;
  password_confirmation: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private httpClient: HttpClient) { }

  // login api
  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post(baseUrl + '/login', body, { headers });
  }

  selectCompany(companyId: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers = new HttpHeaders({
      'Authorization': `${tokenType} ${token}`,
      'Accept': 'application/json'
    });
    return this.httpClient.get(`${baseUrl}/select-company/${companyId}`, { headers });
  }


  // register api
  register(data: RegisterData): Observable<any> {
    const body = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      country_code: data.country_code,
      password: data.password,
      password_confirmation: data.password_confirmation
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post(baseUrl + '/register', body, { headers });
  }
  // Logout API
  // Logout API
  logout(): Observable<any> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      localStorage.clear();
      return throwError(() => new Error('No authentication token found.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.httpClient.post(`${baseUrl}/logout`, {}, { headers }).pipe(
      switchMap((response: any) => {
        if (response.status === true) {
          localStorage.clear();
          return of(response);
        } else {
          localStorage.clear();
          return throwError(() => new Error(response.message || 'Logout failed'));
        }
      }),
      catchError((error) => {
        localStorage.clear();
        return throwError(() => {
          let errorMessage = 'Failed to log out. Please try again.';
          if (error.error) {
            errorMessage = error.error.message || error.error.error || errorMessage;
          } else if (error.message) {
            errorMessage = error.message;
          }
          return new Error(errorMessage);
        });
      })
    );
  }






  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}

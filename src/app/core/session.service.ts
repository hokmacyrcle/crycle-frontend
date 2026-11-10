import { Injectable } from '@angular/core';
import { AppRole, toAppRole } from './roles';

@Injectable({ providedIn: 'root' })
export class SessionService {
  get token(): string | null {
    return localStorage.getItem('access_token');
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  get rawRole(): string | null {
    try {
      const res = JSON.parse(localStorage.getItem('login_response') || '{}');
      return res?.data?.user?.role ?? null;
    } catch {
      return null;
    }
  }

  get role(): AppRole {
    return toAppRole(this.rawRole);
  }

  get userName(): string {
    return localStorage.getItem('name') || 'User';
  }

  get companyName(): string {
    try {
      return JSON.parse(localStorage.getItem('selected_company') || '{}')?.company_name || '';
    } catch {
      return '';
    }
  }
}

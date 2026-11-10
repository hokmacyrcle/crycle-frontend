// Single source of truth for who can see what.
// Backend role names seen so far: 'admin', 'contact'. Add the real employee
// role name here once confirmed with the Laravel users table.
export type AppRole = 'employer' | 'employee';

const EMPLOYER_ROLES = ['admin', 'owner', 'manager', 'accountant', 'employer'];
const EMPLOYEE_ROLES = ['employee', 'contact', 'staff'];

export function toAppRole(rawRole: string | null | undefined): AppRole {
  const r = (rawRole || '').toLowerCase();
  if (EMPLOYEE_ROLES.includes(r)) return 'employee';
  if (EMPLOYER_ROLES.includes(r)) return 'employer';
  return 'employee'; // unknown role = least privilege
}

// Routes (under /admin) an employee may open. Everything else is employer-only.
export const EMPLOYEE_ALLOWED_PREFIXES = ['my-home'];

export const EMPLOYEE_HOME = '/admin/my-home';
export const EMPLOYER_HOME = '/admin/Dashboard';

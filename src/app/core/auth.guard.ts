import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { SessionService } from './session.service';
import { EMPLOYEE_ALLOWED_PREFIXES, EMPLOYEE_HOME } from './roles';

/** Blocks everything under /admin unless the user is logged in. */
export const authGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  return session.isLoggedIn ? true : router.parseUrl('/login');
};

/**
 * Employer = full access. Employee = only EMPLOYEE_ALLOWED_PREFIXES.
 * NOTE: this only controls the app UI. The Laravel API must enforce the same
 * rules (middleware) or an employee could call employer endpoints directly.
 */
export const roleGuard: CanActivateChildFn = (_route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (!session.isLoggedIn) return router.parseUrl('/login');
  if (session.role === 'employer') return true;

  const path = state.url.replace(/^\/admin\/?/, '').split(/[?#]/)[0];
  const allowed = EMPLOYEE_ALLOWED_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));
  return allowed ? true : router.parseUrl(EMPLOYEE_HOME);
};

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@core/auth/auth';
import { isHR } from '@core/auth/models/user.model';

/** Permite acceso solo a roles de RRHH (COMPANY_ADMIN, HR_MANAGER, HR_ANALYST). */
export const hrGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) return router.createUrlTree(['/auth/login']);

  const user = auth.currentUser();
  if (isHR(user?.role)) return true;

  return router.createUrlTree([user?.employeeStatus === 'SELECTED' ? '/onboarding' : '/portal']);
};

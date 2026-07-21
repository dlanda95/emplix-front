import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@core/auth/auth';
import { isHR } from '@core/auth/models/user.model';

/** Permite acceso a roles HR y a usuarios de sistema (sin ficha de empleado). */
export const hrGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) return router.createUrlTree(['/auth/login']);

  const user = auth.currentUser();
  if (isHR(user?.role) || user?.isSystemUser) return true;

  return router.createUrlTree([user?.employeeStatus === 'SELECTED' ? '/onboarding' : '/portal']);
};

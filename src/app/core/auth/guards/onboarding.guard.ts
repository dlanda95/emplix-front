import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@core/auth/auth';

/** Permite acceso solo a candidatos (SELECTED) con onboarding pendiente. */
export const onboardingGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) return router.createUrlTree(['/auth/login']);

  const user = auth.currentUser();
  if (user?.employeeStatus === 'SELECTED') return true;

  // Empleado activo o RRHH → portal o admin
  return router.createUrlTree([user?.role === 'EMPLOYEE' ? '/portal' : '/admin']);
};

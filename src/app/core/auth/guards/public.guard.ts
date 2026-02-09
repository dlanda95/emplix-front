import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService} from '../auth';

export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Si ya está logueado, fuera de aquí, vete al dashboard
    return router.createUrlTree(['/dashboard']);
  }
  return true;
};
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

import { AuthService } from '../auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Usamos el signal computed que creamos antes
  if (authService.isAuthenticated()) {
    return true; // ✅ Pasa, amigo
  }

  // 2. Si no está logueado, redirigir al login
  // Guardamos la URL que intentó visitar para redirigirlo allí después (opcional pero buena UX)
  return router.createUrlTree(['/auth/login']); 
};
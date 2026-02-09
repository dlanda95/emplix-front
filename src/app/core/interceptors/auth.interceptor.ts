import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Inyectamos dependencias dentro de la función (estilo moderno)
  // Nota: AuthService debe exponer un método síncrono para obtener el token sin inyección circular si es posible,
  // o leemos directo de localStorage para evitar ciclos.
  const router = inject(Router);
  
  // Leemos el token directamente para evitar problemas de inyección circular con AuthService
  const token = localStorage.getItem('token');

  let authReq = req;
  
  // 1. Si existe token, lo clonamos e inyectamos en el header
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  // 2. Manejamos la respuesta
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el backend nos dice "401 No Autorizado", el token expiró o es falso
      if (error.status === 401) {
        // Limpiamos sesión y redirigimos
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['auth/login']);
        console.log('[INTERCEPTOR] status', error.status, 'url', req.url);

      }
      
      return throwError(() => error);
      console.log('[INTERCEPTOR] status', error.status, 'url', req.url);

    })
  );
};
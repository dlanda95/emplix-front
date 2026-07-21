import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SessionService } from '../session.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router  = inject(Router);
  const session = inject(SessionService);
  const token   = localStorage.getItem('token');

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        session.clear();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};

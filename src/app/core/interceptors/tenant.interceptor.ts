import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantService } from '../services/tenant.service';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantService = inject(TenantService);
  const storedTenant = tenantService.getTenant();

  // 🔥 LÓGICA DIRECTA: 
  // Si la petición YA TIENE el header (porque lo pusiste a mano desde el input),
  // el interceptor NO hace nada y la deja pasar tal cual.
  if (req.headers.has('x-tenant-slug')) {
    return next(req);
  }

  // Si NO tiene header, entonces sí inyectamos el que tenemos guardado en memoria (si existe)
  // Esto servirá para las peticiones normales (dashboard, perfil, etc.)
  if (storedTenant) {
    const clonedReq = req.clone({
      setHeaders: {
        'x-tenant-slug': storedTenant
      }
    });
    return next(clonedReq);
  }

  return next(req);
};
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantService } from '@core/services/tenant.service';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantService = inject(TenantService);

  if (req.headers.has('x-tenant-slug')) {
    return next(req);
  }

  const tenant = tenantService.getTenant();
  if (tenant) {
    return next(req.clone({ setHeaders: { 'x-tenant-slug': tenant } }));
  }

  return next(req);
};

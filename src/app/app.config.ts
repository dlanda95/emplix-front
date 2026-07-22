import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import {
  provideRouter,
  PreloadAllModules,
  withPreloading,
  withComponentInputBinding,
  withViewTransitions,
  withInMemoryScrolling,
} from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';

import { MsalService, MsalBroadcastService, MSAL_INSTANCE, MsalGuard } from '@azure/msal-angular';
import { MSALInstanceFactory } from '@core/config/msal.config';

import { tenantInterceptor }      from '@core/interceptors/tenant.interceptor';
import { authInterceptor }        from '@core/auth/interceptors/auth-interceptor';
import { apiResponseInterceptor } from '@core/http/api-response.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withComponentInputBinding(),
      withViewTransitions({ skipInitialTransition: true }),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    provideNativeDateAdapter(),

    provideHttpClient(
      withFetch(),
      withInterceptors([tenantInterceptor, authInterceptor, apiResponseInterceptor])
    ),

    { provide: MSAL_INSTANCE, useFactory: MSALInstanceFactory },
    MsalService,
    MsalBroadcastService,
    MsalGuard,

    provideAppInitializer(() => {
      const msalService = inject(MsalService);
      return msalService.instance.initialize();
    }),
  ],
};

import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'; // <--- IMPORTANTE
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideZonelessChangeDetection } from '@angular/core';

// 👇 1. IMPORTAR ESTO
import { provideNativeDateAdapter } from '@angular/material/core';
import { authInterceptor } from './core/auth/interceptors/auth-interceptor';

// Importa tu nuevo interceptor
import { tenantInterceptor } from './core/interceptors/tenant.interceptor';
import { routes } from './app.routes';
// 1. IMPORTAR ESTO

// --- IMPORTS DE MSAL (MICROSOFT) ---
import { 
  MsalService, 
  MsalBroadcastService, 
  MSAL_INSTANCE, 
  MsalGuard
} from '@azure/msal-angular';

import { MSALInstanceFactory } from './core/config/msal.config';





// 🔥 Factoría clave para inicializar MSAL antes de que arranque la App
export function MSALInitializerFactory(msalService: MsalService) {
  return () => msalService.instance.initialize();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    
    // 2. REGISTRAR AQUÍ EL INTERCEPTOR
    provideHttpClient(
      withFetch(),
      withInterceptors([
        tenantInterceptor, // <--- PRIMERO: Identifica la empresa (slug)
        authInterceptor    // <--- SEGUNDO: Pone el token (si existe)
      ]) 
    ),

    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory 
    },
    MsalService,
    MsalBroadcastService,
    MsalGuard,

    {
      provide: APP_INITIALIZER,
      useFactory: MSALInitializerFactory,
      deps: [MsalService],
      multi: true
    }
  ]
};
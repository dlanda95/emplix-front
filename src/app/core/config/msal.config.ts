import { PublicClientApplication, BrowserCacheLocation, LogLevel, IPublicClientApplication } from '@azure/msal-browser';

// --- CONFIGURACIÓN DE ENTRA ID (Azure AD) ---
// Aquí cambias los IDs cuando quieras probar con otro Tenant
export const msalConfig = {
  auth: {
    clientId: 'b0ca416f-07cb-40ca-bbc3-1731d4787a9b', // El ID de la App registrada en Azure (Frontend)
    authority: 'https://login.microsoftonline.com/1dbca999-8575-4483-8073-1a0b076aa9c1', // El ID de tu Tenant (Directorio)
    redirectUri: 'http://localhost:4200', // Debe coincidir con lo registrado en Azure
    postLogoutRedirectUri: 'http://localhost:4200/login'
  },
  cache: {
    
    cacheLocation: BrowserCacheLocation.LocalStorage, // Guarda sesión si refrescas la página
    storeAuthStateInCookie: false, // Déjalo en false a menos que tengas problemas en IE/Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) { return; }
        // console.log(message); // Descomenta para depurar errores de Azure
      },
      logLevel: LogLevel.Error
    }
  }
};

// Función factoría para crear la instancia (Requerido por Angular Standalone)
export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig);
}
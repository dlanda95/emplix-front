import {
  PublicClientApplication,
  BrowserCacheLocation,
  LogLevel,
  IPublicClientApplication,
} from '@azure/msal-browser';
import { environment } from '@env';

export const msalConfig = {
  auth: {
    clientId: environment.azure.clientId,
    // "common" permite usuarios de CUALQUIER tenant de Azure AD (Opción B multi-tenant)
    // El backend valida que el tid del token corresponda al Azure AD de la empresa.
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: environment.redirectUri,
    postLogoutRedirectUri: `${environment.redirectUri}/login`,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii || level > LogLevel.Error) return;
        console.error('[MSAL]', message);
      },
      logLevel: LogLevel.Error,
    },
  },
};

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig);
}

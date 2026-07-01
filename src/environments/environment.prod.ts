// ── PRODUCCIÓN ────────────────────────────────────────────────────────────────
// Actualiza las URLs DESPUÉS de crear los servicios en Railway y Vercel.
// NUNCA pongas aquí secretos: este archivo entra a git y es público en el bundle.
export const environment = {
  production: true,
  // URL pública del backend en Railway (obtenla en: Settings → Networking → Public URL)
  apiUrl: 'https://REEMPLAZAR-CON-TU-URL.up.railway.app/api',
  defaultTenant: 'demo',
  // URL de tu frontend en Vercel (o tu dominio custom)
  redirectUri: 'https://REEMPLAZAR-CON-TU-URL.vercel.app',
  azure: {
    // App Registration de PRODUCCIÓN en portal.azure.com (diferente al de DEV)
    clientId: 'REEMPLAZAR-CON-CLIENT-ID-PROD',
    popupRedirectUri: 'https://REEMPLAZAR-CON-TU-URL.vercel.app/auth-redirect.html',
  },
};

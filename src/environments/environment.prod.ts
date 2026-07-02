// ── PRODUCCIÓN ────────────────────────────────────────────────────────────────
// Actualiza las URLs DESPUÉS de crear los servicios en Railway y Vercel.
// NUNCA pongas aquí secretos: este archivo entra a git y es público en el bundle.
export const environment = {
  production: true,
  // URL pública del backend en Railway (obtenla en: Settings → Networking → Public URL)
  apiUrl: 'https://emplix-api-prod.azurewebsites.net/api',
  defaultTenant: 'demo',
  // URL de tu frontend en Vercel (o tu dominio custom)
  redirectUri: 'https://proud-forest-0baae950f.7.azurestaticapps.net',
  azure: {
    // App Registration de PRODUCCIÓN en portal.azure.com (diferente al de DEV)
    clientId: '40fdfa96-fd34-4c7e-82b0-905097c87714',
    popupRedirectUri: 'https://proud-forest-0baae950f.7.azurestaticapps.net/auth-redirect.html',
  },
};

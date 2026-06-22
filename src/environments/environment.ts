export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  defaultTenant: 'demo',
  redirectUri: 'http://localhost:4200',
  azure: {
    clientId: '262b05a5-0ac3-46e2-8854-e63d0489c30d',
    // Página mínima para el popup — evita que Angular se reinicie en la ventana principal
    popupRedirectUri: 'http://localhost:4200/auth-redirect.html',
  },
};

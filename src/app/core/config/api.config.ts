import { environment } from '../../../environments/environment';

// Este archivo es el "Engranaje Central". 
// Construye las rutas usando el entorno actual (sea local o producción).

export const API_ENDPOINTS = {
  auth: {
    login: `${environment.apiUrl}/auth/login`,
    register: `${environment.apiUrl}/auth/register`,
     checkEmail: `${environment.apiUrl}/auth/check-email`, // <--- NUEVO
    me: `${environment.apiUrl}/auth/me`, // Perfil del usuario
    microsoft: `${environment.apiUrl}/auth/microsoft`, // <--- AGREGA
    verifytenant: `${environment.apiUrl}/auth/verify-tenant`

  },
  portal: {
    requests: `${environment.apiUrl}/requests`, // Solicitudes
    // Aquí agregarás boletas, etc.
  },
  admin: {
    users: `${environment.apiUrl}/users`,
  }
};
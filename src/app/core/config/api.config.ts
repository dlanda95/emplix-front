import { environment } from '@env';

const base = environment.apiUrl;

export const API_ENDPOINTS = {
  auth: {
    login:        `${base}/auth/login`,
    register:     `${base}/auth/register`,
    checkEmail:   `${base}/auth/check-email`,
    me:           `${base}/auth/me`,
    microsoft:    `${base}/auth/microsoft`,
    verifytenant: `${base}/auth/verify-tenant`,
  },
  employees: {
    me:   `${base}/employees/me`,
    root: `${base}/employees`,
  },
  requests: {
    root: `${base}/requests`,
    me:   `${base}/requests/me`,
  },
};

import { Routes } from '@angular/router';

export const PORTAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/portal-layout/portal-layout').then(m => m.PortalLayout),
    children: [
      { path: '', redirectTo: 'ficha', pathMatch: 'full' },
      {
        path: 'ficha',
        loadComponent: () => import('./pages/ficha/ficha').then(m => m.Ficha),
        children: [
          { path: '', redirectTo: 'general', pathMatch: 'full' },
          {
            path: 'general',
            loadComponent: () => import('./pages/ficha/tabs/info-general/info-general').then(m => m.InfoGeneral),
          },
          {
            path: 'historico',
            loadComponent: () => import('./pages/ficha/tabs/historico/historico').then(m => m.Historico),
          },
          {
            path: 'documentos',
            loadComponent: () => import('./pages/ficha/tabs/documentos/documentos').then(m => m.Documentos),
          },
        ],
      },
    ],
  },
];

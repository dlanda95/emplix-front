import { Routes } from '@angular/router';
import { PortalLayout } from './layout/portal-layout/portal-layout';
import { Ficha }        from './pages/ficha/ficha';

export const PORTAL_ROUTES: Routes = [
  {
    path: '',
    component: PortalLayout,
    children: [
      { path: '', redirectTo: 'ficha', pathMatch: 'full' },
      {
        path: 'ficha',
        component: Ficha,
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

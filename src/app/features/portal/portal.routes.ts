import { Routes } from '@angular/router';
import { PortalLayout } from './layout/portal-layout/portal-layout';
import { Ficha } from './pages/ficha/ficha';

export const PORTAL_ROUTES: Routes = [
  {
    path: '',
    component: PortalLayout, // 🏗️ El Shell del Portal
    children: [
      { path: '', redirectTo: 'ficha', pathMatch: 'full' },
      
      // Módulo Ficha (Con sus tabs internos)
      { 
        path: 'ficha', 
        component: Ficha,
        children: [
          { path: '', redirectTo: 'general', pathMatch: 'full' },
          { 
            path: 'general', 
            loadComponent: () => import('./pages/ficha/tabs/info-general/info-general').then(m => m.InfoGeneral) 
          },
        //   { 
        //     path: 'historico', 
        //     loadComponent: () => import('./pages/ficha/tabs/historico/historico').then(m => m.Historico) 
        //   },
        //   { 
        //     path: 'documentos', 
        //     loadComponent: () => import('./pages/ficha/tabs/documentos/documentos').then(m => m.Documentos) 
        //   }
        ]
      },
      
      // Futuros módulos (Placeholders)
    //   { path: 'reconocimientos', loadComponent: () => import('./pages/reconocimientos/reconocimientos.component').then(m => m.ReconocimientosComponent) },
    //   { path: 'equipo', loadComponent: () => import('./pages/equipo/equipo.component').then(m => m.EquipoComponent) }
    //
     ]
  }
];
import { Routes } from '@angular/router';
import { OnboardingShell } from './shell/onboarding-shell';

export const ONBOARDING_ROUTES: Routes = [
  {
    path: '',
    component: OnboardingShell,
    children: [
      { path: '', redirectTo: 'identidad', pathMatch: 'full' },
      { path: 'identidad',  loadComponent: () => import('./steps/paso-identidad/paso-identidad').then(m => m.PasoIdentidad)   },
      { path: 'residencia', loadComponent: () => import('./steps/paso-residencia/paso-residencia').then(m => m.PasoResidencia) },
      { path: 'contacto',   loadComponent: () => import('./steps/paso-contacto/paso-contacto').then(m => m.PasoContacto)       },
      { path: 'financiero', loadComponent: () => import('./steps/paso-financiero/paso-financiero').then(m => m.PasoFinanciero) },
      { path: 'familia',    loadComponent: () => import('./steps/paso-familia/paso-familia').then(m => m.PasoFamilia)          },
      { path: 'documentos', loadComponent: () => import('./steps/paso-documentos/paso-documentos').then(m => m.PasoDocumentos) },
      { path: 'revision',   loadComponent: () => import('./steps/paso-revision/paso-revision').then(m => m.PasoRevision)       },
    ],
  },
];

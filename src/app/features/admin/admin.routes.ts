import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '',           redirectTo: 'candidatos', pathMatch: 'full' },
  {
    path: 'candidatos',
    loadComponent: () => import('./candidates/list/candidates-list').then(m => m.CandidatesList),
  },
  {
    path: 'candidatos/:id',
    loadComponent: () => import('./candidates/detail/candidate-detail').then(m => m.CandidateDetail),
  },
  {
    path: 'colaboradores',
    loadComponent: () => import('./employees/list/employees-list').then(m => m.EmployeesList),
  },
  {
    path: 'solicitudes',
    loadComponent: () => import('./requests/requests-admin').then(m => m.RequestsAdmin),
  },
  {
    path: 'organizacion',
    loadComponent: () => import('./organizacion/organizacion').then(m => m.Organizacion),
  },
];

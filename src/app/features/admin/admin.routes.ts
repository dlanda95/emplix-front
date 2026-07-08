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
    path: 'colaboradores/:id',
    loadComponent: () => import('./employees/detail/employee-detail').then(m => m.EmployeeDetail),
  },
  {
    path: 'solicitudes',
    loadComponent: () => import('./requests/requests-admin').then(m => m.RequestsAdmin),
  },
  {
    path: 'organizacion',
    loadComponent: () => import('./organizacion/organizacion').then(m => m.Organizacion),
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./users/users-page').then(m => m.UsersPage),
  },
  {
    path: 'configuracion',
    children: [
      {
        path: '',
        loadComponent: () => import('./config/config-index').then(m => m.ConfigIndex),
      },
      {
        path: 'tipos-usuario',
        loadComponent: () => import('./config/user-types/user-types-page').then(m => m.UserTypesPage),
      },
      {
        path: 'dominios',
        loadComponent: () => import('./config/domains/domains-page').then(m => m.DomainsPage),
      },
      {
        path: 'metodos-acceso',
        loadComponent: () => import('./config/auth-methods/auth-methods-page').then(m => m.AuthMethodsPage),
      },
    ],
  },
];

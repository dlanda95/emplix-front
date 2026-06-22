import { Routes } from '@angular/router';
import { AuthLayout } from '@core/layout/auth-layout/auth-layout';
import { MainLayout } from '@core/layout/main-layout/main-layout';
import { Login }      from '@features/auth/login/login';
import { Register }   from '@features/auth/register/register';
import { authGuard }  from '@core/auth/guards/auth-guard';
import { publicGuard } from '@core/auth/guards/public.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'auth',
    component: AuthLayout,
    canActivate: [publicGuard],
    children: [
      { path: '',         redirectTo: 'login', pathMatch: 'full' },
      { path: 'login',    component: Login    },
      { path: 'register', component: Register },
    ],
  },

  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('@features/dashboard/home/home').then(m => m.Home) },
      { path: 'portal',    loadChildren: () => import('@features/portal/portal.routes').then(m => m.PORTAL_ROUTES) },
    ],
  },
];

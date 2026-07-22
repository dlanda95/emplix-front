import { Routes } from '@angular/router';
import { authGuard }       from '@core/auth/guards/auth-guard';
import { publicGuard }     from '@core/auth/guards/public.guard';
import { onboardingGuard } from '@core/auth/guards/onboarding.guard';
import { hrGuard }         from '@core/auth/guards/hr.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'auth',
    loadComponent: () => import('@core/layout/auth-layout/auth-layout').then(m => m.AuthLayout),
    canActivate: [publicGuard],
    children: [
      { path: '',               redirectTo: 'login', pathMatch: 'full' },
      { path: 'login',          loadComponent: () => import('@features/auth/login/login').then(m => m.Login) },
      { path: 'register',       loadComponent: () => import('@features/auth/register/register').then(m => m.Register) },
      { path: 'forgot-password', loadComponent: () => import('@features/auth/forgot-password/forgot-password').then(m => m.ForgotPassword) },
      { path: 'reset-password',  loadComponent: () => import('@features/auth/reset-password/reset-password').then(m => m.ResetPassword) },
      { path: 'change-password', loadComponent: () => import('@features/auth/change-password/change-password').then(m => m.ChangePassword) },
    ],
  },

  {
    path: '',
    loadComponent: () => import('@core/layout/main-layout/main-layout').then(m => m.MainLayout),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',  loadComponent: () => import('@features/dashboard/home/home').then(m => m.Home) },
      { path: 'portal',     loadChildren: () => import('@features/portal/portal.routes').then(m => m.PORTAL_ROUTES) },
      { path: 'onboarding', canActivate: [onboardingGuard], loadChildren: () => import('@features/onboarding/onboarding.routes').then(m => m.ONBOARDING_ROUTES) },
      { path: 'admin',      canActivate: [hrGuard],         loadChildren: () => import('@features/admin/admin.routes').then(m => m.ADMIN_ROUTES) },
    ],
  },
];

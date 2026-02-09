import { Routes } from '@angular/router';
import { AuthLayout } from './core/layout/auth-layout/auth-layout';
import { MainLayout } from './core/layout/main-layout/main-layout';
import { Login } from './features/auth/login/login';
import { Home } from './features/dashboard/home/home';
import { Register } from './features/auth/register/register';

import { authGuard } from './core/auth/guards/auth-guard';
import { publicGuard } from './core/auth/guards/public.guard';


export const routes: Routes = [


  // 1. RUTA POR DEFECTO (Redirigir a dashboard o login según prefieras)
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // 2. MUNDO PÚBLICO (Auth)
  {
    path: 'auth',
    component: AuthLayout,
    canActivate: [publicGuard],
    children: [
      {
        path: 'login',
        component: Login
      },


      // 🔥 AGREGAR ESTA RUTA
      { path: 'register', component: Register },
      // Aquí agregaríamos 'register', 'forgot-password', etc.
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // 3. MUNDO PRIVADO (App Principal)
  {
    path: '', // Ruta base para la app interna
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/home/home').then(m => m.Home)
      },
      // Aquí irán 'users', 'settings', 'reports', etc.
    ]
  },

  // 4. WILDCARD (404)
  // Si escribe cualquier cosa rara, mándalo al login o dashboard

];
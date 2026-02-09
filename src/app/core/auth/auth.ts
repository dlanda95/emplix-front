import { Injectable, inject, signal,computed } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, of, delay } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';

import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';


export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  // ... otros campos
}


export interface LoginResponse {
  user: any;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
// ✅ 1. ESTADO DEL TENANT (Empresa)
  // Lo guardamos en señal para usarlo reactivamente
  private _currentTenant = signal<string | null>(localStorage.getItem('saved_tenant'));
  currentTenant = this._currentTenant.asReadonly();

  // Estado del usuario
  private _currentUser = signal<User | null>(this.getUserFromStorage());
  currentUser = this._currentUser.asReadonly();
  isAuthenticated = computed(() => !!this._currentUser());

  // ✅ 2. VERIFICAR EXISTENCIA DEL TENANT (REAL)
  checkTenantAvailability(slug: string): Observable<any> {
    // Headers manuales porque el Interceptor lee del TenantService, 
    // y en este punto (Paso 1) el TenantService AÚN no tiene el valor guardado
    // o queremos validar uno nuevo distinto al guardado.
    const headers = new HttpHeaders().set('x-tenant-slug', slug);

    return this.http.get(API_ENDPOINTS.auth.verifytenant, { headers }).pipe(
      map((response: any) => {
        // Retornamos la info real de la empresa
        return { 
          exists: true, 
          name: response.name, 
          slug: response.slug 
        };
      }),
      catchError((error) => {
        // Si el backend (TenantMiddleware) devuelve 404, es que no existe.
        if (error.status === 404) {
          return throwError(() => new Error('La empresa no existe.'));
        }
        if (error.status === 402) { // Código especial que vimos en tu middleware
          return throwError(() => new Error('Empresa suspendida. Contacte soporte.'));
        }
        return throwError(() => error);
      })
    );
  }



// ✅ 3. LOGIN CONVENCIONAL (Paso 2)
 // LOGIN NORMAL
  login(credentials: { email: string; password: string }): Observable<any> {
    // 🔥 ELIMINADO: La lógica manual de headers.
    // El TenantInterceptor ya inyectará 'x-tenant-slug' automáticamente.
    
    return this.http.post(API_ENDPOINTS.auth.login, credentials).pipe(
      tap((response: any) => this.saveSession(response))
    );
  }
// Setters públicos
  setTenant(slug: string) {
    this._currentTenant.set(slug);
    localStorage.setItem('saved_tenant', slug); // Recordar para la próxima
  }

  // ... (saveSession, getUserFromStorage, logout - se mantienen igual)
  private saveSession(data: any) {
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      this._currentUser.set(data.user);
    }
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // NO borramos 'saved_tenant' para que sea cómodo volver a entrar
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }






  // ✅ Validar si el correo ya está registrado en la empresa actual
  checkEmailAvailability(email: string): Observable<boolean> {
    // El TenantInterceptor inyectará el header 'x-tenant-slug' automáticamente
    // usando el valor que ya guardamos en el TenantService.
    return this.http.post<{ exists: boolean }>(API_ENDPOINTS.auth.checkEmail, { email }).pipe(
      map(response => response.exists)
    );
  }

  // ✅ Registro de usuario (Ahora incluye nombre, apellido, etc)
  register(userData: any): Observable<any> {
    return this.http.post(API_ENDPOINTS.auth.register, userData).pipe(
      tap((response: any) => this.saveSession(response))
    );
  }
}



import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { API_ENDPOINTS } from '@core/config/api.config';
import { User, AuthResponse } from './models/user.model';

export type AuthMethod = 'EMAIL' | 'MICROSOFT' | 'GOOGLE';

export interface TenantInfo {
  exists: boolean;
  name: string;
  slug: string;
  authMethods: AuthMethod[];
  hasMicrosoftSSO: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _currentUser       = signal<User | null>(this.loadUserFromStorage());
  private readonly _currentTenant     = signal<string | null>(localStorage.getItem('saved_tenant'));
  private readonly _tenantAuthMethods = signal<AuthMethod[]>(['EMAIL']);

  readonly currentUser       = this._currentUser.asReadonly();
  readonly currentTenant     = this._currentTenant.asReadonly();
  readonly tenantAuthMethods = this._tenantAuthMethods.asReadonly();
  readonly isAuthenticated   = computed(() => !!this._currentUser());
  readonly hasMicrosoftSSO   = computed(() => this._tenantAuthMethods().includes('MICROSOFT'));

  checkTenantAvailability(slug: string): Observable<TenantInfo> {
    const headers = new HttpHeaders().set('x-tenant-slug', slug);
    return this.http.get<any>(API_ENDPOINTS.auth.verifytenant, { headers }).pipe(
      map(res => {
        const d = res?.data ?? res;
        const info: TenantInfo = {
          exists: true,
          name: d.name,
          slug: d.slug,
          authMethods: d.authMethods ?? ['EMAIL'],
          hasMicrosoftSSO: d.hasMicrosoftSSO ?? false,
        };
        // Guardar los métodos para el paso 2
        this._tenantAuthMethods.set(info.authMethods);
        return info;
      }),
      catchError(err => {
        if (err.status === 404) return throwError(() => new Error('La empresa no existe. Verifica el ID de tu organización.'));
        if (err.status === 402) return throwError(() => new Error('Empresa suspendida. Contacta al soporte.'));
        return throwError(() => new Error('Error de conexión. Intenta nuevamente.'));
      }),
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<any>(API_ENDPOINTS.auth.login, credentials).pipe(
      map(res => (res?.data ?? res) as AuthResponse),
      tap(data => this.saveSession(data)),
    );
  }

  loginWithMicrosoft(idToken: string): Observable<AuthResponse> {
    return this.http.post<any>(API_ENDPOINTS.auth.microsoft, { token: idToken }).pipe(
      map(res => (res?.data ?? res) as AuthResponse),
      tap(data => this.saveSession(data)),
    );
  }

  /** Ruta inicial después de autenticarse, según el rol y estado del empleado */
  getPostLoginRoute(): string[] {
    const user = this._currentUser();
    if (!user) return ['/auth/login'];
    if (user.role === 'COMPANY_ADMIN' || user.role === 'HR_MANAGER' || user.role === 'HR_ANALYST') {
      return ['/admin/candidatos'];
    }
    if (user.employeeStatus === 'SELECTED') {
      return ['/onboarding'];
    }
    return ['/portal'];
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.auth.register, userData).pipe(
      map(res => res?.data ?? res),
      tap(data => this.saveSession(data)),
    );
  }

  checkEmailAvailability(email: string): Observable<boolean> {
    return this.http.post<any>(API_ENDPOINTS.auth.checkEmail, { email }).pipe(
      map(res => !!(res?.data ?? res).exists),
    );
  }

  setTenant(slug: string): void {
    this._currentTenant.set(slug);
    localStorage.setItem('saved_tenant', slug);
  }

  patchCurrentUser(patch: Partial<User>): void {
    const user = this._currentUser();
    if (!user) return;
    const updated = { ...user, ...patch };
    localStorage.setItem('user', JSON.stringify(updated));
    this._currentUser.set(updated);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._currentUser.set(null);
    this._tenantAuthMethods.set(['EMAIL']);
    this.router.navigate(['/auth/login']);
  }

  private saveSession(data: AuthResponse): void {
    if (!data?.token) return;
    // Combinar status del empleado en el objeto user para disponibilizarlo en guards
    const user = {
      ...data.user,
      employeeStatus:   data.employeeStatus   ?? data.user.employeeStatus   ?? null,
      onboardingStatus: data.onboardingStatus ?? data.user.onboardingStatus ?? null,
    };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(user));
    this._currentUser.set(user);
  }

  private loadUserFromStorage(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
}

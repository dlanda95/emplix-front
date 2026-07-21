import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';

export interface TenantDomain {
  id:        string;
  domain:    string;
  label:     string | null;
  isPrimary: boolean;
  isActive:  boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicDomain {
  id:        string;
  domain:    string;
  label:     string | null;
  isPrimary: boolean;
}

@Injectable({ providedIn: 'root' })
export class DomainsConfigService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/config/domains`;

  /** Sin autenticación — para la página de login */
  getPublicDomains(): Observable<PublicDomain[]> {
    return this.http.get<PublicDomain[]>(`${this.base}/public`);
  }

  list(): Observable<TenantDomain[]> {
    return this.http.get<TenantDomain[]>(this.base);
  }

  create(payload: { domain: string; label?: string }): Observable<TenantDomain> {
    return this.http.post<TenantDomain>(this.base, payload);
  }

  update(id: string, payload: { label?: string; isActive?: boolean }): Observable<TenantDomain> {
    return this.http.patch<TenantDomain>(`${this.base}/${id}`, payload);
  }

  setPrimary(id: string): Observable<TenantDomain> {
    return this.http.patch<TenantDomain>(`${this.base}/${id}/set-primary`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

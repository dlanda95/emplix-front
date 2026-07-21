import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';

export interface AuthMethodConfig {
  id:             string;
  method:         'EMAIL' | 'MICROSOFT';
  enabled:        boolean;
  azureTenantId?: string | null;
}

export interface UpsertAuthMethodDto {
  enabled:        boolean;
  azureTenantId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthMethodsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/config/auth-methods`;

  list(): Observable<AuthMethodConfig[]> {
    return this.http.get<AuthMethodConfig[]>(this.base);
  }

  upsert(method: string, dto: UpsertAuthMethodDto): Observable<AuthMethodConfig> {
    return this.http.put<AuthMethodConfig>(`${this.base}/${method.toLowerCase()}`, dto);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env';

export interface ChangeRequest {
  id: string;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string | null;
  createdAt: string;
  data?: Record<string, unknown> | null;
  user?: {
    email: string;
    employee?: {
      firstName: string;
      lastName: string;
      documentId?: string | null;
      position?: { name: string } | null;
    } | null;
  } | null;
}

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PagedResult<T> {
  data:       T[];
  total:      number;
  page:       number;
  totalPages: number;
}

export interface RequestListParams {
  page?:   number;
  limit?:  number;
  status?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class RequestsAdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/requests`;

  getAll(params: RequestListParams = {}): Observable<PagedResult<ChangeRequest>> {
    const p: Record<string, string> = { type: 'PROFILE_UPDATE' };
    if (params.page)           p['page']   = String(params.page);
    if (params.limit)          p['limit']  = String(params.limit);
    if (params.status)         p['status'] = params.status;
    if (params.search?.trim()) p['search'] = params.search.trim();
    return this.http.get<PagedResult<ChangeRequest>>(this.base, { params: p });
  }

  approve(id: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/status`, { status: 'APPROVED' });
  }

  reject(id: string, reason: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/status`, { status: 'REJECTED', reason });
  }
}

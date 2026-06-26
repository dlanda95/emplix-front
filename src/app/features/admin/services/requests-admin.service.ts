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

@Injectable({ providedIn: 'root' })
export class RequestsAdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/requests`;

  getAll(status?: RequestStatus): Observable<ChangeRequest[]> {
    const params = status ? `?type=PROFILE_UPDATE&status=${status}` : '?type=PROFILE_UPDATE';
    return this.http.get<any>(`${this.base}${params}`).pipe(
      map(r => r?.data ?? r ?? [])
    );
  }

  approve(id: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/status`, { status: 'APPROVED' });
  }

  reject(id: string, reason: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/status`, { status: 'REJECTED', reason });
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';

export interface DashboardStats {
  totalEmployees:    number;
  pendingRequests:   number;
  newHiresThisMonth: number;
  pendingCandidates: number;
}

export interface RecentRequest {
  id:        string;
  type:      string;
  createdAt: string;
  userName:  string;
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  VACATION:       'solicitó vacaciones',
  PERMIT:         'solicitó un permiso',
  SICK_LEAVE:     'registró baja por enfermedad',
  HOME_OFFICE:    'solicitó teletrabajo',
  PROFILE_UPDATE: 'solicitó actualización de perfil',
};

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/dashboard`;

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/stats`);
  }

  getRecentRequests(): Observable<RecentRequest[]> {
    return this.http.get<RecentRequest[]>(`${this.base}/recent-requests`);
  }

  typeLabel(type: string): string {
    return REQUEST_TYPE_LABELS[type] ?? type.toLowerCase().replace('_', ' ');
  }
}

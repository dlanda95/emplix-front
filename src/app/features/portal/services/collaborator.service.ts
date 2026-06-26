import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env';
import { CollaboratorProfile } from '../models/collaborator.model';
import { ProfileUpdateRequest } from '../models/profile-update.model';
import { TimelineEvent } from '../models/employment-history.model';
import { EmployeeDocument } from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class CollaboratorService {
  private readonly http     = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/employees`;

  getProfile(): Observable<CollaboratorProfile> {
    return this.http.get<any>(`${this.endpoint}/me`).pipe(
      map(res => (res?.data ?? res) as CollaboratorProfile)
    );
  }

  hasPendingProfileUpdate(): Observable<boolean> {
    return this.hasPendingForSection('personal');
  }

  /** Detecta si hay una solicitud pendiente para una sección específica del perfil. */
  hasPendingForSection(section: 'personal' | 'address' | 'financial'): Observable<boolean> {
    return this.http.get<any>(`${environment.apiUrl}/requests/me`).pipe(
      map(res => {
        const requests: any[] = res?.data ?? res ?? [];
        return requests.some(r => {
          if (r.type !== 'PROFILE_UPDATE' || r.status !== 'PENDING') return false;
          const d = r.data ?? {};
          if (section === 'address')   return 'address' in d || 'district' in d || 'departmentdirec' in d;
          if (section === 'financial') return 'bankAccount' in d || 'bankEntity' in d || 'afpType' in d;
          return 'firstName' in d || 'maritalStatus' in d || 'birthDate' in d || 'documentId' in d;
        });
      })
    );
  }

  requestProfileUpdate(payload: ProfileUpdateRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/requests`, payload);
  }

  /** Crea una solicitud de cambio con snapshot de valores anteriores para que RRHH pueda comparar. */
  requestChange(section: 'address' | 'financial' | 'personal', newData: Record<string, unknown>, previousData: Record<string, unknown>): Observable<void> {
    return this.requestProfileUpdate({
      type: 'PROFILE_UPDATE',
      data: { ...newData, _previous: previousData } as any,
    });
  }

  getDocuments(): Observable<EmployeeDocument[]> {
    return this.http.get<any>(`${this.endpoint}/me/documents`).pipe(
      map(res => (res?.data ?? res) as EmployeeDocument[])
    );
  }

  getEmploymentHistory(): Observable<TimelineEvent[]> {
    return this.http.get<any>(`${this.endpoint}/me/history`).pipe(
      map(res => (res?.data ?? res) as TimelineEvent[])
    );
  }

  updateProfile(data: Partial<CollaboratorProfile>): Observable<CollaboratorProfile> {
    return this.http.patch<any>(`${this.endpoint}/me`, data).pipe(
      map(res => (res?.data ?? res) as CollaboratorProfile)
    );
  }
}

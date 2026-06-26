import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';
import { FamilyMember, FamilyMemberPayload } from '../models/family.model';

@Injectable({ providedIn: 'root' })
export class FamiliaService {
  private readonly http = inject(HttpClient);
  private readonly url  = `${environment.apiUrl}/family`;

  getAll(): Observable<FamilyMember[]> {
    return this.http.get<FamilyMember[]>(this.url);
  }

  create(payload: FamilyMemberPayload): Observable<FamilyMember> {
    return this.http.post<FamilyMember>(this.url, payload);
  }

  update(id: string, payload: Partial<FamilyMemberPayload>): Observable<FamilyMember> {
    return this.http.patch<FamilyMember>(`${this.url}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

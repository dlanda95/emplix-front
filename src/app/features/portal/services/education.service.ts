import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';
import { Education, EducationPayload } from '../models/education.model';

@Injectable({ providedIn: 'root' })
export class EducationService {
  private readonly http = inject(HttpClient);
  private readonly url  = `${environment.apiUrl}/education`;

  getAll(): Observable<Education[]> {
    return this.http.get<Education[]>(this.url);
  }

  create(payload: EducationPayload): Observable<Education> {
    return this.http.post<Education>(this.url, payload);
  }

  update(id: string, payload: Partial<EducationPayload>): Observable<Education> {
    return this.http.patch<Education>(`${this.url}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

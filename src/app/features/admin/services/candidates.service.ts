import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env';

export interface DeptWithPositions {
  id:        string;
  name:      string;
  positions: { id: string; name: string }[];
}

export interface EmployeeMinimal {
  id:        string;
  firstName: string;
  lastName:  string;
  position?: { name: string } | null;
}

export interface CandidateSummary {
  id:              string;
  firstName:       string;
  lastName:        string;
  middleName?:     string | null;
  documentType?:   string | null;
  documentId?:     string | null;
  onboardingStatus?:string | null;
  hireDate:        string;
  position?:       { name: string } | null;
  department?:     { name: string } | null;
  user?:           { email: string; isActive: boolean } | null;
}

export interface CreateCandidatePayload {
  firstName:    string;
  lastName:     string;
  middleName?:  string;
  documentType: string;
  documentId:   string;
  hireDate:     string;
  positionId?:  string;
  departmentId?:string;
}

@Injectable({ providedIn: 'root' })
export class CandidatesService {
  private readonly http     = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/candidates`;

  list(): Observable<CandidateSummary[]> {
    return this.http.get<any>(this.endpoint).pipe(map(r => r?.data ?? r));
  }

  get(id: string): Observable<any> {
    return this.http.get<any>(`${this.endpoint}/${id}`).pipe(map(r => r?.data ?? r));
  }

  create(payload: CreateCandidatePayload): Observable<any> {
    return this.http.post<any>(this.endpoint, payload).pipe(map(r => r?.data ?? r));
  }

  updateHrData(id: string, data: Record<string, unknown>): Observable<any> {
    return this.http.patch<any>(`${this.endpoint}/${id}/hr-data`, data).pipe(map(r => r?.data ?? r));
  }

  activate(id: string, corporateEmail: string): Observable<any> {
    return this.http.post<any>(`${this.endpoint}/${id}/activate`, { corporateEmail }).pipe(map(r => r?.data ?? r));
  }

  listDepartments(): Observable<DeptWithPositions[]> {
    return this.http.get<any>(`${environment.apiUrl}/organization/departments`).pipe(map(r => r?.data ?? r));
  }

  listPositions(): Observable<{ id: string; name: string }[]> {
    return this.http.get<any>(`${environment.apiUrl}/organization/positions`).pipe(
      map(r => (r?.data ?? r).map((p: any) => ({ id: p.id, name: p.name })))
    );
  }

  listActiveEmployees(): Observable<EmployeeMinimal[]> {
    return this.http.get<any>(`${environment.apiUrl}/employees`).pipe(map(r => r?.data ?? r));
  }

  getDocUrl(docId: string): Observable<string> {
    return this.http.get<any>(`${environment.apiUrl}/employees/documents/${docId}/url`).pipe(map(r => r?.url ?? r?.data?.url ?? ''));
  }
}

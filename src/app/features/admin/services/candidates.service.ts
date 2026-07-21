import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env';
import type { EmployeeDocument } from '@features/portal/models/document.model';

export interface AreaPosition {
  id:   string;
  name: string;
}

export interface AreaChild {
  id:        string;
  name:      string;
  positions: AreaPosition[];
}

export interface DeptWithPositions {
  id:        string;
  name:      string;
  positions: AreaPosition[];
  children:  AreaChild[];
}

export interface EmployeeMinimal {
  id:        string;
  firstName: string;
  lastName:  string;
  position?: { name: string } | null;
}

export interface CandidateSummary {
  id:               string;
  status:           'SELECTED' | 'ACTIVE' | 'TERMINATED' | 'ON_LEAVE';
  firstName:        string;
  lastName:         string;
  middleName?:      string | null;
  documentType?:    string | null;
  documentId?:      string | null;
  onboardingStatus?: string | null;
  hireDate:         string;
  position?:        { name: string } | null;
  department?:      { name: string } | null;
  user?:            { email: string; isActive: boolean } | null;
}

export interface CandidateDetail {
  id:               string;
  status:           'SELECTED' | 'ACTIVE' | 'TERMINATED' | 'ON_LEAVE';
  firstName:        string;
  lastName:         string;
  middleName:       string | null;
  secondLastName:   string | null;
  documentType:     string | null;
  documentId:       string | null;
  birthDate:        string | null;
  gender:           string | null;
  maritalStatus:    string | null;
  cellPhone:        string | null;
  personalEmail:    string | null;
  emergencyName:    string | null;
  emergencyPhone:   string | null;
  address:          string | null;
  district:         string | null;
  departmentdirec:  string | null;
  afpType:          string | null;
  afpEntity:        string | null;
  bankEntity:       string | null;
  bankAccount:      string | null;
  onboardingStatus: 'DOCS_SUBMITTED' | 'COMPLETED' | 'PENDING' | null;
  departmentId:     string | null;
  positionId:       string | null;
  supervisorId:     string | null;
  department:       { id: string; name: string; parent: { id: string; name: string } | null } | null;
  position:         { id: string; name: string } | null;
  supervisor:       { id: string; firstName: string; lastName: string } | null;
  documents:        EmployeeDocument[];
  selectionProcess: {
    id:         string;
    code:       string;
    department: { id: string; name: string; parent: { id: string; name: string } | null } | null;
    position:   { id: string; name: string } | null;
  } | null;
}

export interface CreateCandidatePayload {
  firstName:     string;
  lastName:      string;
  middleName?:   string;
  documentType:  string;
  documentId:    string;
  personalEmail: string;
  hireDate:      string;
  positionId?:   string;
  departmentId?: string;
}

export interface CreateCandidateResult {
  employee:          CandidateDetail;
  temporaryPassword: string;
  emailSent:         boolean;
  emailError?:       string;
}

export interface PagedResult<T> {
  data:       T[];
  total:      number;
  page:       number;
  totalPages: number;
}

export interface CandidateListParams {
  page?:             number;
  limit?:            number;
  search?:           string;
  onboardingStatus?: string;
}

@Injectable({ providedIn: 'root' })
export class CandidatesService {
  private readonly http     = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/candidates`;

  list(params: CandidateListParams = {}): Observable<PagedResult<CandidateSummary>> {
    const p: Record<string, string> = {};
    if (params.page)             p['page']             = String(params.page);
    if (params.limit)            p['limit']            = String(params.limit);
    if (params.search?.trim())   p['search']           = params.search.trim();
    if (params.onboardingStatus) p['onboardingStatus'] = params.onboardingStatus;
    return this.http.get<PagedResult<CandidateSummary>>(this.endpoint, { params: p });
  }

  get(id: string): Observable<CandidateDetail> {
    return this.http.get<CandidateDetail>(`${this.endpoint}/${id}`);
  }

  create(payload: CreateCandidatePayload): Observable<CreateCandidateResult> {
    return this.http.post<CreateCandidateResult>(this.endpoint, payload);
  }

  updateHrData(id: string, data: Record<string, unknown>): Observable<CandidateDetail> {
    return this.http.patch<CandidateDetail>(`${this.endpoint}/${id}/hr-data`, data);
  }

  activate(id: string, corporateEmail: string): Observable<void> {
    return this.http.post<void>(`${this.endpoint}/${id}/activate`, { corporateEmail });
  }

  listDepartments(): Observable<DeptWithPositions[]> {
    return this.http.get<DeptWithPositions[]>(`${environment.apiUrl}/organization/departments`);
  }

  listPositions(): Observable<{ id: string; name: string }[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/organization/positions`).pipe(
      map(positions => positions.map(p => ({ id: p.id, name: p.name }))),
    );
  }

  listActiveEmployees(): Observable<EmployeeMinimal[]> {
    return this.http.get<any>(`${environment.apiUrl}/employees`).pipe(
      map(r => Array.isArray(r) ? r : (r?.data ?? r?.items ?? [])),
    );
  }

  getDocUrl(docId: string): Observable<string> {
    return this.http.get<{ url: string }>(`${environment.apiUrl}/employees/documents/${docId}/url`).pipe(
      map(r => r?.url ?? ''),
    );
  }
}

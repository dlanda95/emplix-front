import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env';
import type { CandidateSummary, PagedResult } from './candidates.service';

export type SelectionProcessStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';

export interface SPApprover {
  id:         string;
  order:      number;
  employeeId: string;
  employee:   { id: string; firstName: string; lastName: string; position?: { name: string } | null };
}

export interface SelectionProcess {
  id:          string;
  code:        string;
  name:        string;
  description: string | null;
  status:      SelectionProcessStatus;
  openedAt:    string;
  closedAt:    string | null;
  createdAt:   string;
  department:  { id: string; name: string; parent: { id: string; name: string } | null } | null;
  position:    { id: string; name: string } | null;
  approvers:   SPApprover[];
  _count:      { candidates: number };
}

export interface CreateSelectionProcessPayload {
  description?: string;
  departmentId: string;
  positionId:   string;
  approverIds:  string[];
}

export interface UpdateSelectionProcessPayload {
  description?: string | null;
  status?:      SelectionProcessStatus;
}

export interface ListSelectionProcessesParams {
  page?:   number;
  limit?:  number;
  status?: SelectionProcessStatus;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class SelectionProcessesService {
  private readonly http     = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/selection-processes`;

  list(params: ListSelectionProcessesParams = {}): Observable<PagedResult<SelectionProcess>> {
    const queryParams: Record<string, string> = {};
    if (params.page)   queryParams['page']   = String(params.page);
    if (params.limit)  queryParams['limit']  = String(params.limit);
    if (params.status) queryParams['status'] = params.status;
    if (params.search?.trim()) queryParams['search'] = params.search.trim();
    return this.http.get<PagedResult<SelectionProcess>>(this.endpoint, { params: queryParams });
  }

  get(processId: string): Observable<SelectionProcess> {
    return this.http.get<SelectionProcess>(`${this.endpoint}/${processId}`);
  }

  create(payload: CreateSelectionProcessPayload): Observable<SelectionProcess> {
    return this.http.post<SelectionProcess>(this.endpoint, payload);
  }

  update(processId: string, payload: UpdateSelectionProcessPayload): Observable<SelectionProcess> {
    return this.http.patch<SelectionProcess>(`${this.endpoint}/${processId}`, payload);
  }

  listCandidates(
    processId: string,
    params: { page?: number; limit?: number; search?: string; onboardingStatus?: string } = {},
  ): Observable<PagedResult<CandidateSummary>> {
    const queryParams: Record<string, string> = {};
    if (params.page)             queryParams['page']             = String(params.page);
    if (params.limit)            queryParams['limit']            = String(params.limit);
    if (params.search?.trim())   queryParams['search']           = params.search!.trim();
    if (params.onboardingStatus) queryParams['onboardingStatus'] = params.onboardingStatus;
    return this.http.get<any>(`${this.endpoint}/${processId}/candidates`, { params: queryParams }).pipe(
      map(r => ({ ...r, data: Array.isArray(r) ? r : (r?.data ?? []) })),
    );
  }
}

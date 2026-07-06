import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';

export interface EmployeeSummary {
  id:            string;
  firstName:     string;
  lastName:      string;
  middleName?:   string | null;
  documentType?: string | null;
  documentId?:   string | null;
  status:        string;
  hireDate?:     string | null;
  photoUrl?:     string | null;
  position?:     { id: string; name: string } | null;
  department?:   { id: string; name: string; code?: string | null } | null;
  supervisor?:   { id: string; firstName: string; lastName: string } | null;
  user?:         { email: string; role: string; isActive: boolean } | null;
}

export interface EmployeeDetail extends EmployeeSummary {
  birthDate?:     string | null;
  phone?:         string | null;
  cellPhone?:     string | null;
  personalEmail?: string | null;
  address?:       string | null;
  district?:      string | null;
  province?:      string | null;
  laborData?: {
    salary?:        number | null;
    hierarchyLevel?: string | null;
    startDate?:     string | null;
    contractType?:  { id: string; name: string } | null;
    workShift?:     { id: string; name: string } | null;
  } | null;
}

export interface PagedResult<T> {
  data:       T[];
  total:      number;
  page:       number;
  totalPages: number;
}

export interface EmployeeListParams {
  page?:         number;
  limit?:        number;
  search?:       string;
  departmentId?: string;
}

@Injectable({ providedIn: 'root' })
export class EmployeesAdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/employees`;

  list(params: EmployeeListParams = {}): Observable<PagedResult<EmployeeSummary>> {
    const p: Record<string, string> = {};
    if (params.page)         p['page']         = String(params.page);
    if (params.limit)        p['limit']        = String(params.limit);
    if (params.search?.trim()) p['search']     = params.search.trim();
    if (params.departmentId) p['departmentId'] = params.departmentId;
    return this.http.get<PagedResult<EmployeeSummary>>(this.base, { params: p });
  }

  getById(id: string): Observable<EmployeeDetail> {
    return this.http.get<EmployeeDetail>(`${this.base}/${id}`);
  }
}

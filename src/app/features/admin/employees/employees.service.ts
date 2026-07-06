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

@Injectable({ providedIn: 'root' })
export class EmployeesAdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/employees`;

  list(): Observable<EmployeeSummary[]> {
    return this.http.get<EmployeeSummary[]>(this.base);
  }

  getById(id: string): Observable<EmployeeDetail> {
    return this.http.get<EmployeeDetail>(`${this.base}/${id}`);
  }
}

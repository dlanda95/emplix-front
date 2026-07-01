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

@Injectable({ providedIn: 'root' })
export class EmployeesAdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/employees`;

  list(): Observable<EmployeeSummary[]> {
    return this.http.get<EmployeeSummary[]>(this.base);
  }
}

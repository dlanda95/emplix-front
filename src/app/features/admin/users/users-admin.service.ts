import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';

export type UserRole = 'COMPANY_ADMIN' | 'HR_MANAGER' | 'HR_ANALYST' | 'AREA_MANAGER' | 'EMPLOYEE';

export interface UserListItem {
  id:        string;
  email:     string;
  role:      UserRole;
  isActive:  boolean;
  createdAt: string;
  employee: {
    id:         string;
    firstName:  string;
    lastName:   string;
    photoUrl?:  string | null;
    position?:  { name: string } | null;
    department?:{ name: string } | null;
  } | null;
}

export interface CreateSystemUserPayload {
  firstName: string;
  lastName:  string;
  email:     string;
  role:      UserRole;
  password:  string;
}

export interface CreateEmployeeDirectPayload {
  firstName:       string;
  lastName:        string;
  email:           string;
  documentId?:     string;
  hireDate:        string;
  role:            UserRole;
  departmentId?:   string;
  positionId?:     string;
  supervisorId?:   string;
  contractTypeId?: string;
  workShiftId?:    string;
  salary?:         number;
  grantAccess:     boolean;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  COMPANY_ADMIN: 'Administrador',
  HR_MANAGER:    'Gerente RH',
  HR_ANALYST:    'Analista RH',
  AREA_MANAGER:  'Gerente de Área',
  EMPLOYEE:      'Empleado',
};

export const ROLE_VARIANTS: Record<UserRole, 'primary' | 'success' | 'warning' | 'neutral' | 'error'> = {
  COMPANY_ADMIN: 'primary',
  HR_MANAGER:    'success',
  HR_ANALYST:    'primary',
  AREA_MANAGER:  'warning',
  EMPLOYEE:      'neutral',
};

@Injectable({ providedIn: 'root' })
export class UsersAdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}`;

  listUsers(): Observable<UserListItem[]> {
    return this.http.get<UserListItem[]>(`${this.base}/users`);
  }

  createSystemUser(payload: CreateSystemUserPayload): Observable<UserListItem> {
    return this.http.post<UserListItem>(`${this.base}/users`, payload);
  }

  updateRole(userId: string, role: UserRole): Observable<UserListItem> {
    return this.http.patch<UserListItem>(`${this.base}/users/${userId}/role`, { role });
  }

  toggleStatus(userId: string): Observable<UserListItem> {
    return this.http.patch<UserListItem>(`${this.base}/users/${userId}/toggle-status`, {});
  }

  createEmployeeDirect(payload: CreateEmployeeDirectPayload): Observable<any> {
    return this.http.post<any>(`${this.base}/employees`, payload);
  }
}

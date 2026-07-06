import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';

export type UserRole = 'COMPANY_ADMIN' | 'HR_MANAGER' | 'HR_ANALYST' | 'AREA_MANAGER' | 'EMPLOYEE';

export interface PermissionSet {
  canRead:          boolean;
  canCreate:        boolean;
  canEdit:          boolean;
  canDelete:        boolean;
  canApprove:       boolean;
  canManageConfig:  boolean;
  canManageUsers:   boolean;
}

export interface SystemUserType {
  id:          string;
  name:        string;
  slug:        string;
  description: string | null;
  permissions: PermissionSet;
  color:       string;
  isSystem:    boolean;
  isActive:    boolean;
  _count?:     { users: number };
}

export interface UserListItem {
  id:             string;
  email:          string;
  role:           UserRole;
  firstName:      string | null;
  lastName:       string | null;
  isActive:       boolean;
  isSystemUser:   boolean;
  createdAt:      string;
  systemUserType: SystemUserType | null;
  employee: {
    id:          string;
    firstName:   string;
    lastName:    string;
    photoUrl?:   string | null;
    position?:   { name: string } | null;
    department?: { name: string } | null;
  } | null;
}

export interface CreateSystemUserPayload {
  firstName:        string;
  lastName:         string;
  email:            string;
  systemUserTypeId: string;
  password:         string;
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

  updateUserType(userId: string, systemUserTypeId: string): Observable<UserListItem> {
    return this.http.patch<UserListItem>(`${this.base}/users/${userId}/system-type`, { systemUserTypeId });
  }

  toggleStatus(userId: string): Observable<UserListItem> {
    return this.http.patch<UserListItem>(`${this.base}/users/${userId}/toggle-status`, {});
  }

  createEmployeeDirect(payload: CreateEmployeeDirectPayload): Observable<any> {
    return this.http.post<any>(`${this.base}/employees`, payload);
  }

  // System config endpoints
  listSystemUserTypes(): Observable<SystemUserType[]> {
    return this.http.get<SystemUserType[]>(`${this.base}/system-config`);
  }

  createSystemUserType(payload: Partial<SystemUserType>): Observable<SystemUserType> {
    return this.http.post<SystemUserType>(`${this.base}/system-config`, payload);
  }

  updateSystemUserType(id: string, payload: Partial<SystemUserType>): Observable<SystemUserType> {
    return this.http.patch<SystemUserType>(`${this.base}/system-config/${id}`, payload);
  }

  deleteSystemUserType(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/system-config/${id}`);
  }
}

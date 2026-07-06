export type UserRole =
  | 'COMPANY_ADMIN'
  | 'HR_MANAGER'
  | 'HR_ANALYST'
  | 'AREA_MANAGER'
  | 'EMPLOYEE';

export type EmployeeStatus = 'SELECTED' | 'ACTIVE' | 'TERMINATED' | 'ON_LEAVE';
export type OnboardingStatus = 'PENDING_DOCS' | 'DOCS_SUBMITTED' | 'COMPLETED';

export interface PermissionSet {
  canRead:         boolean;
  canCreate:       boolean;
  canEdit:         boolean;
  canDelete:       boolean;
  canApprove:      boolean;
  canManageConfig: boolean;
  canManageUsers:  boolean;
}

export interface SystemUserTypeRef {
  id:          string;
  name:        string;
  slug:        string;
  color:       string;
  permissions: PermissionSet;
}

export interface User {
  id:               string;
  firstName:        string;
  lastName:         string;
  email:            string;
  role:             UserRole;
  tenantSlug:       string;
  isSystemUser?:    boolean;
  systemUserType?:  SystemUserTypeRef | null;
  employeeStatus?:  EmployeeStatus  | null;
  onboardingStatus?:OnboardingStatus | null;
}

export const HR_ROLES: UserRole[] = ['COMPANY_ADMIN', 'HR_MANAGER', 'HR_ANALYST'];

export function isHR(role?: UserRole): boolean {
  return !!role && HR_ROLES.includes(role);
}

export interface AuthResponse {
  user:             User;
  token:            string;
  employeeStatus?:  EmployeeStatus  | null;
  onboardingStatus?:OnboardingStatus | null;
}

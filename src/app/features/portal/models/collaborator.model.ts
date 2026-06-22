export interface CollaboratorProfile {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  secondLastName?: string | null;

  documentId?: string | null;
  birthDate?: string | null;
  gender?: string | null;

  personalEmail?: string | null;
  phone?: string | null;

  address?: string | null;
  district?: string | null;
  province?: string | null;
  departmentdirec?: string | null;

  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;

  status: 'ACTIVE' | 'TERMINATED' | 'ON_LEAVE';
  hireDate: string;
  photoUrl?: string | null;

  user?: { email: string; isActive: boolean };
  position?: { name: string };
  department?: { name: string };
}

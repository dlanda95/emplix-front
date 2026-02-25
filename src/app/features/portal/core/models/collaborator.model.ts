export interface CollaboratorProfile {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  secondLastName?: string | null;
  
  // Identity
  documentId?: string | null; // Mapping for 'Nro. Documento'
  birthDate?: string | null;  // ISO Date string
  gender?: string | null;
  
  // Contact
  personalEmail?: string | null;
  phone?: string | null;

  
  // System Status
  status: 'ACTIVE' | 'TERMINATED' | 'ON_LEAVE';
  hireDate: string;
  photoUrl?: string | null;

  // Relations (Optional data based on your backend include)
  user?: {
    email: string;
    isActive: boolean;
  };
  position?: {
    name: string;
  };
  department?: {
    name: string;
  };



// ... campos anteriores (id, firstName, etc.)
  
  // Address & Location
  address?: string | null;      // Campo único en tu BD actual
  
  // Emergency Contact (¡Sí lo tienes en tu Schema!)
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;

  // Campos futuros (Opcionales por ahora)
  district?: string | null;
  province?: string | null;
  departmentdirec?: string | null;
}



export interface CollaboratorProfile {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  secondLastName?: string | null;

  documentId?:    string | null;
  birthDate?:     string | null;
  gender?:        string | null;
  maritalStatus?: string | null;
  nationality?:   string | null;
  academicLevel?: string | null;

  birthCountry?:  string | null;
  birthRegion?:   string | null;
  birthDistrict?: string | null;
  licenseNumber?: string | null;
  altDocId?:      string | null;

  personalEmail?: string | null;
  phone?:         string | null;
  cellPhone?:     string | null;

  address?:         string | null;
  district?:        string | null;
  province?:        string | null;
  departmentdirec?: string | null;
  addressRef?:      string | null;
  documentType?:   string | null;
  docAddress?:     string | null;
  docDistrict?:    string | null;
  docDepartment?:  string | null;
  docAddressRef?:  string | null;
  onboardingStatus?: string | null;

  emergencyName?:  string | null;
  emergencyPhone?: string | null;
  emergencyRel?:   string | null;

  afpType?:       string | null;
  afpEntity?:     string | null;
  afpCommission?: string | null;
  bankEntity?:    string | null;
  bankAccount?:   string | null;
  bankCci?:       string | null;

  status: 'ACTIVE' | 'TERMINATED' | 'ON_LEAVE';
  hireDate: string;
  photoUrl?: string | null;

  user?: { email: string; isActive: boolean };
  position?: { name: string };
  department?: { name: string };
}

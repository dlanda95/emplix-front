export interface Education {
  id:          string;
  employeeId:  string;
  level:       string;
  institution: string;
  program:     string;
  startYear:   number;
  endYear?:    number | null;
  status:      string;
  country?:    string | null;
  createdAt:   string;
  updatedAt:   string;
}

export interface EducationPayload {
  level:       string;
  institution: string;
  program:     string;
  startYear:   number;
  endYear?:    number | null;
  status:      string;
  country?:    string | null;
}

export const EDUCATION_STATUS_OPTIONS = [
  { value: 'COMPLETED',   label: 'Completado'  },
  { value: 'IN_PROGRESS', label: 'En progreso' },
  { value: 'ABANDONED',   label: 'Abandonado'  },
];

export const EDUCATION_STATUS_VARIANT: Record<string, string> = {
  COMPLETED:   'success',
  IN_PROGRESS: 'warning',
  ABANDONED:   'neutral',
};

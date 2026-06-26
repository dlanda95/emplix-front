export type FamilyRelationship =
  | 'FATHER' | 'MOTHER' | 'GUARDIAN'
  | 'SPOUSE' | 'PARTNER'
  | 'SON' | 'DAUGHTER'
  | 'SIBLING'
  | 'DEPENDENT' | 'HEIR'
  | 'OTHER';

export interface FamilyMember {
  id:           string;
  employeeId:   string;
  firstName:    string;
  lastName:     string;
  relationship: FamilyRelationship;
  documentType: string;
  documentId:   string | null;
  birthDate:    string | null;
  phone:        string | null;
  isDependent:  boolean;
  isHeir:       boolean;
  createdAt:    string;
  updatedAt:    string;
}

export interface FamilyMemberPayload {
  firstName:    string;
  lastName:     string;
  relationship: FamilyRelationship;
  documentType: string;
  documentId?:  string;
  birthDate?:   string;
  phone?:       string;
  isDependent?: boolean;
  isHeir?:      boolean;
}

export const RELATIONSHIP_LABELS: Record<FamilyRelationship, string> = {
  FATHER:    'Padre',
  MOTHER:    'Madre',
  GUARDIAN:  'Tutor / Apoderado',
  SPOUSE:    'Cónyuge',
  PARTNER:   'Conviviente',
  SON:       'Hijo',
  DAUGHTER:  'Hija',
  SIBLING:   'Hermano/a',
  DEPENDENT: 'Dependiente',
  HEIR:      'Heredero/a',
  OTHER:     'Otro',
};

export interface CatalogOption {
  value: string;
  label: string;
}

export const GENDER_OPTIONS: CatalogOption[] = [
  { value: 'MALE',          label: 'Masculino'    },
  { value: 'FEMALE',        label: 'Femenino'     },
  { value: 'NON_BINARY',    label: 'No binario'   },
  { value: 'UNDISCLOSED',   label: 'Prefiero no indicar' },
];

export const MARITAL_STATUS_OPTIONS: CatalogOption[] = [
  { value: 'SINGLE',        label: 'Soltero/a'    },
  { value: 'MARRIED',       label: 'Casado/a'     },
  { value: 'COHABITING',    label: 'Conviviente'  },
  { value: 'SEPARATED',     label: 'Separado/a'   },
  { value: 'DIVORCED',      label: 'Divorciado/a' },
  { value: 'WIDOWED',       label: 'Viudo/a'      },
  { value: 'CIVIL_UNION',   label: 'Unión Civil'  },
];

export const ACADEMIC_LEVEL_OPTIONS: CatalogOption[] = [
  { value: 'SECONDARY',          label: 'Secundaria Completa' },
  { value: 'TECHNICAL',          label: 'Técnico'             },
  { value: 'BACHELOR',           label: 'Bachiller'           },
  { value: 'PROFESSIONAL_TITLE', label: 'Título Profesional'  },
  { value: 'MASTER',             label: 'Maestría'            },
  { value: 'DOCTORATE',          label: 'Doctorado'           },
];

export const DOCUMENT_TYPE_OPTIONS: CatalogOption[] = [
  { value: 'DNI',      label: 'DNI — Documento Nacional de Identidad' },
  { value: 'CE',       label: 'CE — Carnet de Extranjería'            },
  { value: 'PASAPORTE',label: 'Pasaporte'                             },
  { value: 'PTP',      label: 'PTP — Permiso Temporal de Permanencia' },
];

export const AFP_TYPE_OPTIONS: CatalogOption[] = [
  { value: 'AFP', label: 'AFP (Sistema Privado)' },
  { value: 'ONP', label: 'ONP (Sistema Público)' },
];

export const AFP_ENTITY_OPTIONS: CatalogOption[] = [
  { value: 'Habitat',   label: 'AFP Habitat'   },
  { value: 'Integra',   label: 'AFP Integra'   },
  { value: 'Prima',     label: 'AFP Prima'     },
  { value: 'Profuturo', label: 'AFP Profuturo' },
];

export const AFP_COMMISSION_OPTIONS: CatalogOption[] = [
  { value: 'FLOW',  label: 'Comisión por flujo' },
  { value: 'MIXED', label: 'Comisión mixta'     },
];

export const HIGHER_EDUCATION_LEVELS = new Set([
  'TECHNICAL', 'BACHELOR', 'PROFESSIONAL_TITLE', 'MASTER', 'DOCTORATE',
]);

export function catalogLabel(options: CatalogOption[], value: string | null | undefined): string {
  return options.find(o => o.value === value)?.label ?? value ?? '-';
}

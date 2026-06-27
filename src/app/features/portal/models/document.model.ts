export type EmployeeDocumentType =
  | 'CONTRACT'
  | 'ID_CARD'
  | 'CERTIFICATION'
  | 'MEDICAL'
  | 'OTHER';

// Categorías virtuales: no existen en la BD, son filtros por prefijo de nombre
// RESUME       → OTHER docs cuyo name empieza con CV_
// ADDRESS_PROOF → OTHER docs cuyo name empieza con RECIBO_
export type DocCategoryId =
  | EmployeeDocumentType
  | 'ALL'
  | 'RESUME'
  | 'ADDRESS_PROOF';

export interface EmployeeDocument {
  id:            string;
  name:          string;
  originalName?: string;
  mimeType:      string;
  size:          number;
  type:          EmployeeDocumentType;
  isPublic:      boolean;
  uploadedBy?:   string;
  createdAt:     string;
}

export interface DocCategory {
  type:      DocCategoryId;
  label:     string;
  icon:      string;
  // Para categorías virtuales: tipo real que se envía al backend + label de prefijo
  uploadAs?: { type: EmployeeDocumentType; label: string };
}

export const DOC_CATEGORIES: DocCategory[] = [
  { type: 'ALL',          label: 'Todos',            icon: 'folder_open'       },
  { type: 'RESUME',       label: 'CV',               icon: 'description',        uploadAs: { type: 'OTHER', label: 'CV'               } },
  { type: 'ID_CARD',      label: 'Identidad',        icon: 'badge'              },
  { type: 'ADDRESS_PROOF',label: 'Recibo Domicilio', icon: 'home',               uploadAs: { type: 'OTHER', label: 'RECIBO_DOMICILIO'  } },
  { type: 'CONTRACT',     label: 'Contratos',        icon: 'gavel'              },
  { type: 'CERTIFICATION',label: 'Certificados',     icon: 'workspace_premium'  },
  { type: 'MEDICAL',      label: 'Médico',           icon: 'medical_services'   },
  { type: 'OTHER',        label: 'Otros',            icon: 'folder'             },
];

export const DOC_TYPE_LABELS: Record<EmployeeDocumentType, string> = {
  CONTRACT:      'Contrato',
  ID_CARD:       'Identidad',
  CERTIFICATION: 'Certificado',
  MEDICAL:       'Médico',
  OTHER:         'Otro',
};

/** Filtra documentos según la categoría activa (incluye virtuales) */
export function filterDocsByCategory(docs: EmployeeDocument[], cat: DocCategoryId): EmployeeDocument[] {
  switch (cat) {
    case 'ALL':          return docs;
    case 'RESUME':       return docs.filter(d => d.type === 'OTHER' && d.name.toUpperCase().startsWith('CV_'));
    case 'ADDRESS_PROOF':return docs.filter(d => d.type === 'OTHER' && d.name.toUpperCase().startsWith('RECIBO_'));
    case 'OTHER':        return docs.filter(d => d.type === 'OTHER'
                                && !d.name.toUpperCase().startsWith('CV_')
                                && !d.name.toUpperCase().startsWith('RECIBO_'));
    default:             return docs.filter(d => d.type === cat);
  }
}

export interface FileIconConfig {
  icon:  string;
  bg:    string;
  color: string;
}

export const getFileIconConfig = (mimeType: string, name: string): FileIconConfig => {
  const m = mimeType.toLowerCase();
  const n = name.toLowerCase();
  if (m.includes('pdf') || n.endsWith('.pdf'))
    return { icon: 'picture_as_pdf', bg: '#fef2f2', color: '#ef4444' };
  if (m.includes('word') || n.match(/\.docx?$/))
    return { icon: 'description',    bg: '#eff6ff', color: '#3b82f6' };
  if (m.includes('excel') || m.includes('spreadsheet') || n.match(/\.xlsx?$/))
    return { icon: 'table_chart',    bg: '#f0fdf4', color: '#10b981' };
  if (m.includes('image'))
    return { icon: 'image',          bg: '#faf5ff', color: '#8b5cf6' };
  if (m.includes('zip') || m.includes('compress'))
    return { icon: 'archive',        bg: '#fff7ed', color: '#f97316' };
  return   { icon: 'insert_drive_file', bg: '#f9fafb', color: '#9ca3af' };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024)     return `${bytes} B`;
  if (bytes < 1048576)  return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

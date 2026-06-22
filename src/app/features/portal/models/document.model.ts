export type EmployeeDocumentType =
  | 'CONTRACT'
  | 'ID_CARD'
  | 'CERTIFICATION'
  | 'MEDICAL'
  | 'OTHER';

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
  type:  EmployeeDocumentType | 'ALL';
  label: string;
  icon:  string;
}

export const DOC_CATEGORIES: DocCategory[] = [
  { type: 'ALL',           label: 'Todos',         icon: 'folder_open'        },
  { type: 'CONTRACT',      label: 'Contratos',     icon: 'gavel'              },
  { type: 'ID_CARD',       label: 'Identidad',     icon: 'badge'              },
  { type: 'CERTIFICATION', label: 'Certificados',  icon: 'workspace_premium'  },
  { type: 'MEDICAL',       label: 'Médico',        icon: 'medical_services'   },
  { type: 'OTHER',         label: 'Otros',         icon: 'folder'             },
];

export const DOC_TYPE_LABELS: Record<EmployeeDocumentType, string> = {
  CONTRACT:      'Contrato',
  ID_CARD:       'Identidad',
  CERTIFICATION: 'Certificado',
  MEDICAL:       'Médico',
  OTHER:         'Otro',
};

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

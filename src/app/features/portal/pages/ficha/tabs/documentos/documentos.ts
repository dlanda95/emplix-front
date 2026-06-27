import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { CollaboratorService } from '@features/portal/services/collaborator.service';
import {
  EmployeeDocument, EmployeeDocumentType,
} from '@features/portal/models/document.model';
import {
  Banner, Button, DocCard, DocUploadZone, EmptyState, LoadingSkeleton, Modal,
} from '@shared/ui';
import type { UploadPayload } from '@shared/ui';
import { environment } from '@env';

export interface DocSection {
  type:  EmployeeDocumentType;
  label: string;
  icon:  string;
}

const SECTIONS: DocSection[] = [
  { type: 'CONTRACT',      label: 'Contratos',    icon: 'gavel'             },
  { type: 'ID_CARD',       label: 'Identidad',    icon: 'badge'             },
  { type: 'CERTIFICATION', label: 'Certificados', icon: 'workspace_premium' },
  { type: 'MEDICAL',       label: 'Médico',       icon: 'medical_services'  },
  { type: 'OTHER',         label: 'Otros',        icon: 'folder_open'       },
];

const DOC_TYPE_DISPLAY: Record<string, string> = {
  DNI: 'DNI', PASSPORT: 'Pasaporte', CE: 'Carnet de Extranjería',
  RUC: 'RUC', PTP: 'PTP',
};

@Component({
  selector: 'app-documentos',
  imports: [Banner, Button, DocCard, DocUploadZone, EmptyState, LoadingSkeleton, Modal],
  templateUrl: './documentos.html',
  styleUrl: './documentos.scss',
})
export class Documentos {
  private readonly collaboratorService = inject(CollaboratorService);
  private readonly http                = inject(HttpClient);

  readonly sections      = SECTIONS;
  readonly allDocs       = signal<EmployeeDocument[] | undefined>(undefined);
  readonly isLoading     = signal(true);
  readonly uploadError   = signal('');
  readonly isUploading   = signal(false);

  readonly showModal   = signal(false);
  readonly uploadType  = signal<EmployeeDocumentType>('OTHER');

  // Texto de documento declarado en el perfil (para la sección Identidad)
  readonly declaredDoc = signal<string | null>(null);

  readonly docsFor = (type: EmployeeDocumentType) =>
    (this.allDocs() ?? []).filter(d => d.type === type);

  readonly countFor = (type: EmployeeDocumentType) => this.docsFor(type).length;

  constructor() {
    this.load();
  }

  private load(): void {
    this.isLoading.set(true);
    this.collaboratorService.getDocuments().subscribe({
      next: docs => { this.allDocs.set(docs); this.isLoading.set(false); },
      error: ()  => { this.allDocs.set([]);   this.isLoading.set(false); },
    });
    this.collaboratorService.getProfile().subscribe({
      next: profile => {
        const type = profile.documentType;
        const num  = profile.documentId;
        if (type || num) {
          const label = type ? (DOC_TYPE_DISPLAY[type] ?? type) : '';
          this.declaredDoc.set([label, num].filter(Boolean).join(' · '));
        }
      },
    });
  }

  openUploadFor(type: EmployeeDocumentType): void {
    this.uploadType.set(type);
    this.uploadError.set('');
    this.showModal.set(true);
  }

  async onDownload(doc: EmployeeDocument): Promise<void> {
    try {
      const res: any = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/employees/documents/${doc.id}/url`)
      );
      const url = res?.data ?? res?.url ?? res;
      if (typeof url === 'string') window.open(url, '_blank');
    } catch {
      this.uploadError.set('No se pudo generar el enlace de descarga.');
    }
  }

  async onFileSelected(payload: UploadPayload): Promise<void> {
    this.isUploading.set(true);
    this.uploadError.set('');

    const form = new FormData();
    form.append('file', payload.file);
    form.append('type', payload.type);

    try {
      await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/employees/me/documents`, form)
      );
      this.showModal.set(false);
      this.load();
    } catch (err: any) {
      this.uploadError.set(err?.error?.message ?? 'Error al subir el archivo.');
    } finally {
      this.isUploading.set(false);
    }
  }

  sectionLabel(type: EmployeeDocumentType): string {
    return SECTIONS.find(s => s.type === type)?.label ?? type;
  }
}

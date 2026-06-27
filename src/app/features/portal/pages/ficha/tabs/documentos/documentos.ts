import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { CollaboratorService } from '@features/portal/services/collaborator.service';
import {
  EmployeeDocument, EmployeeDocumentType,
  DOC_CATEGORIES, DOC_TYPE_LABELS,
} from '@features/portal/models/document.model';
import {
  Banner, Button, DocCard, DocUploadZone,
  EmptyState, LoadingSkeleton, Modal, PageHeader, TabsCard,
} from '@shared/ui';
import type { UploadPayload, TabItem } from '@shared/ui';
import { ToolbarLayout } from '@shared/layout';
import { environment } from '@env';

const DOC_TYPE_DISPLAY: Record<string, string> = {
  DNI: 'DNI', PASSPORT: 'Pasaporte', CE: 'Carnet de Extranjería',
  RUC: 'RUC', PTP: 'PTP',
};

@Component({
  selector: 'app-documentos',
  imports: [
    Banner, Button, DocCard, DocUploadZone,
    EmptyState, LoadingSkeleton, Modal, PageHeader, TabsCard, ToolbarLayout,
  ],
  templateUrl: './documentos.html',
  styleUrl:    './documentos.scss',
})
export class Documentos {
  private readonly collaboratorService = inject(CollaboratorService);
  private readonly http                = inject(HttpClient);

  readonly activeCategory  = signal<EmployeeDocumentType | 'ALL'>('ALL');
  readonly showUploadModal = signal(false);
  readonly isUploading     = signal(false);
  readonly uploadError     = signal('');
  readonly allDocs         = signal<EmployeeDocument[] | undefined>(undefined);
  readonly declaredDoc     = signal<string | null>(null);

  readonly filteredDocs = computed(() => {
    const docs = this.allDocs();
    if (!docs) return undefined;
    const cat = this.activeCategory();
    return cat === 'ALL' ? docs : docs.filter(d => d.type === cat);
  });

  readonly tabItems = computed<TabItem[]>(() =>
    DOC_CATEGORIES.map(cat => ({ id: cat.type, label: cat.label, icon: cat.icon }))
  );

  // Tipo a pre-seleccionar en el modal: el tab activo si no es ALL
  readonly uploadDocType = computed<EmployeeDocumentType | undefined>(() => {
    const cat = this.activeCategory();
    return cat === 'ALL' ? undefined : cat as EmployeeDocumentType;
  });

  constructor() { this.load(); }

  private load(): void {
    this.allDocs.set(undefined);
    this.collaboratorService.getDocuments().subscribe({
      next: docs => this.allDocs.set(docs),
      error: ()  => this.allDocs.set([]),
    });
    this.collaboratorService.getProfile().subscribe({
      next: p => {
        if (p.documentType || p.documentId) {
          const label = p.documentType ? (DOC_TYPE_DISPLAY[p.documentType] ?? p.documentType) : '';
          this.declaredDoc.set([label, p.documentId].filter(Boolean).join(' · '));
        }
      },
    });
  }

  selectCategory(type: string): void {
    this.activeCategory.set(type as EmployeeDocumentType | 'ALL');
  }

  openUpload(): void {
    this.uploadError.set('');
    this.showUploadModal.set(true);
  }

  activeCategoryLabel(): string {
    const cat = this.activeCategory();
    if (cat === 'ALL') return 'Todos los documentos';
    return DOC_TYPE_LABELS[cat as EmployeeDocumentType] ?? 'Documentos';
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
      this.showUploadModal.set(false);
      this.load();
    } catch (err: any) {
      this.uploadError.set(err?.error?.message ?? 'Error al subir el archivo.');
    } finally {
      this.isUploading.set(false);
    }
  }
}

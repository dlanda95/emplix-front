import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { CollaboratorService } from '@features/portal/services/collaborator.service';
import {
  EmployeeDocument, EmployeeDocumentType,
  DOC_CATEGORIES, DOC_TYPE_LABELS,
} from '@features/portal/models/document.model';
import {
  DocCard, DocUploadZone, EmptyState, Modal, LoadingSkeleton, ConfirmModal,
} from '@shared/ui';
import type { UploadPayload } from '@shared/ui';
import { environment } from '@env';

@Component({
  selector: 'app-documentos',
  imports: [DocCard, DocUploadZone, EmptyState, Modal, LoadingSkeleton, ConfirmModal],
  templateUrl: './documentos.html',
  styleUrl: './documentos.scss',
})
export class Documentos {
  private readonly collaboratorService = inject(CollaboratorService);
  private readonly http                = inject(HttpClient);

  // ─── Estado ──────────────────────────────────────────────────────────────
  readonly categories      = DOC_CATEGORIES;
  readonly activeCategory  = signal<EmployeeDocumentType | 'ALL'>('ALL');
  readonly showUploadModal = signal(false);
  readonly isUploading     = signal(false);
  readonly uploadError     = signal('');

  // ─── Confirmación de eliminación ──────────────────────────────────────────
  readonly showConfirmDelete = signal(false);
  readonly docToDelete       = signal<EmployeeDocument | null>(null);

  // ─── Documentos ──────────────────────────────────────────────────────────
  readonly allDocs = signal<EmployeeDocument[] | undefined>(undefined);

  readonly filteredDocs = computed(() => {
    const docs = this.allDocs();
    if (!docs) return undefined;
    const cat = this.activeCategory();
    return cat === 'ALL' ? docs : docs.filter(d => d.type === cat);
  });

  readonly countFor = computed(() => {
    const docs = this.allDocs() ?? [];
    const counts: Record<string, number> = { ALL: docs.length };
    for (const d of docs) counts[d.type] = (counts[d.type] ?? 0) + 1;
    return counts;
  });

  constructor() { this.loadDocs(); }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  activeCategoryLabel(): string {
    if (this.activeCategory() === 'ALL') return 'Todos los documentos';
    return DOC_TYPE_LABELS[this.activeCategory() as EmployeeDocumentType] ?? 'Documentos';
  }

  // ─── Acciones ────────────────────────────────────────────────────────────

  selectCategory(type: EmployeeDocumentType | 'ALL'): void {
    this.activeCategory.set(type);
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

  onDeleteRequest(doc: EmployeeDocument): void {
    this.docToDelete.set(doc);
    this.showConfirmDelete.set(true);
  }

  async onDeleteConfirmed(): Promise<void> {
    const doc = this.docToDelete();
    if (!doc) return;
    this.showConfirmDelete.set(false);

    try {
      await firstValueFrom(
        this.http.delete(`${environment.apiUrl}/employees/documents/${doc.id}`)
      );
      this.allDocs.update(docs => docs?.filter(d => d.id !== doc.id));
      this.docToDelete.set(null);
    } catch {
      this.uploadError.set('No se pudo eliminar el documento. Intenta nuevamente.');
    }
  }

  onDeleteCancelled(): void {
    this.showConfirmDelete.set(false);
    this.docToDelete.set(null);
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
      this.loadDocs();
    } catch (err: any) {
      this.uploadError.set(err?.error?.message ?? 'Error al subir el archivo.');
    } finally {
      this.isUploading.set(false);
    }
  }

  private loadDocs(): void {
    this.allDocs.set(undefined);
    this.collaboratorService.getDocuments().subscribe({
      next: docs => this.allDocs.set(docs),
      error: ()  => this.allDocs.set([]),
    });
  }
}

import { Component, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Banner, SectionCard, DocUploadZone, Button } from '@shared/ui';
import { environment } from '@env';
import type { UploadPayload } from '@shared/ui';
import type { EmployeeDocumentType } from '@features/portal/models/document.model';
import { OnboardingService } from '../../services/onboarding.service';

interface DocSection {
  key:     string;
  label:   string;
  hint:    string;
  type:    EmployeeDocumentType;
  docName: string;
}

const SECTIONS: DocSection[] = [
  { key: 'identity', label: 'Documento de Identidad',       hint: 'Sube una copia de tu DNI, CE, Pasaporte o PTP.',                     type: 'ID_CARD', docName: 'DNI_CE'          },
  { key: 'cv',       label: 'Currículum Vitae',              hint: 'Adjunta tu CV actualizado en formato PDF.',                            type: 'OTHER',   docName: 'CV'              },
  { key: 'receipt',  label: 'Recibo de Servicios (Domicilio)', hint: 'Un recibo reciente de agua, luz o teléfono que acredite tu domicilio.', type: 'OTHER',   docName: 'RECIBO_DOMICILIO' },
];

@Component({
  selector: 'app-paso-documentos',
  imports: [Banner, SectionCard, DocUploadZone, Button],
  templateUrl: './paso-documentos.html',
  styles: [`
    .doc-sections { display: flex; flex-direction: column; gap: 1rem; }
    .section-hint { margin: 0 0 0.75rem; font-size: 0.875rem; color: var(--text-secondary); }
    .doc-footer   { display: flex; justify-content: flex-end; margin-top: 0.5rem; }

    .upload-progress {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 1.25rem; background: var(--bg-surface);
      border: 1px solid var(--border-color); border-radius: var(--radius-md);
      color: var(--text-secondary); font-size: 0.875rem;
      &__icon { font-size: 1.5rem; color: var(--color-primary); animation: spin 1.2s linear infinite; }
    }

    .upload-done {
      display: flex; align-items: center; gap: 0.875rem;
      padding: 1rem 1.25rem; background: var(--bg-surface);
      border: 1.5px solid var(--color-success, #16a34a); border-radius: var(--radius-md);
      &__check { font-size: 1.75rem; color: var(--color-success, #16a34a); flex-shrink: 0; }
      &__info  { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
      &__name  { font-size: 0.875rem; font-weight: 600; color: var(--text-main);
                 white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      &__label { font-size: 0.75rem; color: var(--color-success, #16a34a); }
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class PasoDocumentos {
  private readonly http     = inject(HttpClient);
  readonly svc              = inject(OnboardingService);
  private readonly endpoint = `${environment.apiUrl}/employees/me/documents`;

  readonly sections  = SECTIONS;
  readonly saved     = signal(false);
  readonly showSave  = computed(() =>
    !this.svc.isStepSaved('documentos') || this.svc.isDirty('documentos')
  );

  constructor() {
    this.loadExistingDocs();

    // Auto-guardar paso cuando TODOS los docs estén listos
    effect(() => {
      const s = this.svc.docStates();
      const allDone = SECTIONS.every(sec => s[sec.key] === 'done');
      if (allDone) this.svc.markSaved('documentos');
    });
  }

  stateOf(key: string) { return this.svc.docStateOf(key); }
  nameOf(key: string)  { return this.svc.docNames()[key] ?? ''; }

  onUpload(section: DocSection, payload: UploadPayload): void {
    this.svc.setDocState(section.key, 'uploading');

    const form = new FormData();
    form.append('file',  payload.file);
    form.append('type',  section.type);
    form.append('label', section.docName);

    this.http.post<any>(this.endpoint, form).subscribe({
      next: (res) => {
        const doc = res?.data ?? res;
        this.svc.setDocState(section.key, 'done');
        this.svc.setDocName(section.key, doc?.name ?? payload.file.name);
      },
      error: () => this.svc.setDocState(section.key, 'error'),
    });
  }

  saveDocs(): void {
    this.svc.markSaved('documentos');
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }

  replace(key: string): void {
    this.svc.setDocState(key, 'idle');
    this.svc.clearDocName(key);
    this.svc.markDirty('documentos');
  }

  // Detecta docs ya subidos en sesiones anteriores (sobrevive a refresh)
  private loadExistingDocs(): void {
    this.http.get<any>(`${this.endpoint}`).subscribe({
      next: (res) => {
        const docs: any[] = res?.data ?? res ?? [];
        for (const doc of docs) {
          const key = this.resolveSection(doc);
          if (key && this.svc.docStateOf(key) !== 'done') {
            this.svc.setDocState(key, 'done');
            this.svc.setDocName(key, doc.name ?? doc.originalName ?? '');
          }
        }
      },
      error: () => {},
    });
  }

  private resolveSection(doc: { type: string; name?: string }): string | null {
    if (doc.type === 'ID_CARD') return 'identity';
    const name = (doc.name ?? '').toUpperCase();
    if (name.startsWith('CV_'))      return 'cv';
    if (name.startsWith('RECIBO_'))  return 'receipt';
    return null;
  }
}

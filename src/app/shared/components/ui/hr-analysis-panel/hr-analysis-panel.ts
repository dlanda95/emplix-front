import {
  Component, DestroyRef, inject, signal, computed,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Banner }          from '../banner/banner';
import { Button }          from '../button/button';
import { LoadingSkeleton } from '../loading-skeleton/loading-skeleton';
import { Modal }           from '../modal/modal';
import { HRAnalysisService, HRAnalysis, HRAnalysisDoc, HRRecommendation, UpsertHRAnalysisPayload } from '@features/admin/services/hr-analysis.service';
import type { SelectOption } from '../app-select/app-select';

const RECOMMENDATION_OPTIONS: SelectOption[] = [
  { value: 'PENDING',                label: 'Pendiente de evaluación'       },
  { value: 'APPROVED',               label: 'Recomendar para la posición'   },
  { value: 'CONDITIONALLY_APPROVED', label: 'Con condiciones'                },
  { value: 'REJECTED',               label: 'No recomendado'                },
];

const REC_BADGE: Record<HRRecommendation, { variant: string; label: string; icon: string }> = {
  PENDING:                { variant: 'warning', label: 'Pendiente',         icon: 'hourglass_empty'  },
  APPROVED:               { variant: 'success', label: 'Recomendado',       icon: 'verified'         },
  CONDITIONALLY_APPROVED: { variant: 'info',    label: 'Con condiciones',   icon: 'info'             },
  REJECTED:               { variant: 'error',   label: 'No recomendado',    icon: 'cancel'           },
};

const SECTIONS: { key: keyof UpsertHRAnalysisPayload; label: string; icon: string }[] = [
  { key: 'professionalSummary',  label: 'Resumen profesional',       icon: 'person'            },
  { key: 'strengths',            label: 'Fortalezas',                icon: 'thumb_up'          },
  { key: 'improvementAreas',     label: 'Áreas de mejora',           icon: 'trending_up'       },
  { key: 'interviewResults',     label: 'Resultados de entrevistas', icon: 'record_voice_over' },
  { key: 'competencyEvaluation', label: 'Evaluación de competencias',icon: 'psychology'        },
  { key: 'identifiedRisks',      label: 'Riesgos identificados',     icon: 'warning'           },
];

@Component({
  selector: 'app-hr-analysis-panel',
  imports: [CommonModule, ReactiveFormsModule, Banner, Button, LoadingSkeleton, Modal],
  templateUrl: './hr-analysis-panel.html',
  host: { style: 'display:block' },
})
export class HRAnalysisPanel {
  private readonly svc         = inject(HRAnalysisService);
  private readonly fb          = inject(FormBuilder);
  private readonly sanitizer   = inject(DomSanitizer);
  private readonly destroyRef  = inject(DestroyRef);

  // ── Inputs del modal ──────────────────────────────────────────────────────
  readonly processId     = signal('');
  readonly candidateId   = signal('');
  readonly candidateName = signal('');
  readonly canEdit       = signal(false);

  // ── Estado interno ────────────────────────────────────────────────────────
  readonly isOpen        = signal(false);
  readonly isLoading     = signal(false);
  readonly isSaving      = signal(false);
  readonly isEditMode    = signal(false);
  readonly saveError     = signal('');
  readonly analysis      = signal<HRAnalysis | null>(null);

  // Vista previa de documento
  readonly previewDoc    = signal<HRAnalysisDoc | null>(null);
  readonly previewUrl    = signal<SafeResourceUrl | null>(null);
  readonly previewLoading= signal(false);

  // Upload de archivo
  readonly isUploading   = signal(false);
  readonly uploadError   = signal('');

  // Catálogos
  readonly sections      = SECTIONS;
  readonly recOptions    = RECOMMENDATION_OPTIONS;
  readonly recBadge      = REC_BADGE;

  readonly hasContent = computed(() => {
    const a = this.analysis();
    if (!a) return false;
    return !!(
      a.professionalSummary || a.strengths || a.improvementAreas ||
      a.interviewResults || a.competencyEvaluation || a.identifiedRisks ||
      a.recommendationNotes || a.documents.length > 0
    );
  });

  readonly recommendation = computed(() =>
    this.analysis()?.recommendation ?? 'PENDING'
  );

  // ── Formulario de edición ─────────────────────────────────────────────────
  readonly editForm = this.fb.group({
    professionalSummary:  [''],
    strengths:            [''],
    improvementAreas:     [''],
    interviewResults:     [''],
    competencyEvaluation: [''],
    identifiedRisks:      [''],
    recommendation:       ['PENDING'],
    recommendationNotes:  [''],
  });

  // ── API pública: abrir modal ──────────────────────────────────────────────
  open(processId: string, candidateId: string, candidateName: string, canEdit: boolean): void {
    this.processId.set(processId);
    this.candidateId.set(candidateId);
    this.candidateName.set(candidateName);
    this.canEdit.set(canEdit);
    this.isEditMode.set(false);
    this.previewDoc.set(null);
    this.previewUrl.set(null);
    this.uploadError.set('');
    this.saveError.set('');
    this.isOpen.set(true);
    this.loadAnalysis();
  }

  close(): void { this.isOpen.set(false); }

  // ── Carga de datos ────────────────────────────────────────────────────────
  private loadAnalysis(): void {
    this.isLoading.set(true);
    this.svc.get(this.processId(), this.candidateId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => { this.analysis.set(data); this.isLoading.set(false); },
        error: () => { this.analysis.set(null); this.isLoading.set(false); },
      });
  }

  // ── Edición ───────────────────────────────────────────────────────────────
  startEdit(): void {
    const a = this.analysis();
    this.editForm.reset({
      professionalSummary:  a?.professionalSummary  ?? '',
      strengths:            a?.strengths            ?? '',
      improvementAreas:     a?.improvementAreas     ?? '',
      interviewResults:     a?.interviewResults     ?? '',
      competencyEvaluation: a?.competencyEvaluation ?? '',
      identifiedRisks:      a?.identifiedRisks      ?? '',
      recommendation:       a?.recommendation       ?? 'PENDING',
      recommendationNotes:  a?.recommendationNotes  ?? '',
    });
    this.saveError.set('');
    this.isEditMode.set(true);
  }

  cancelEdit(): void { this.isEditMode.set(false); }

  save(): void {
    this.isSaving.set(true);
    this.saveError.set('');
    const v = this.editForm.value;
    const payload: UpsertHRAnalysisPayload = {
      professionalSummary:  v.professionalSummary  || null,
      strengths:            v.strengths            || null,
      improvementAreas:     v.improvementAreas     || null,
      interviewResults:     v.interviewResults     || null,
      competencyEvaluation: v.competencyEvaluation || null,
      identifiedRisks:      v.identifiedRisks      || null,
      recommendation:       (v.recommendation as HRRecommendation) || 'PENDING',
      recommendationNotes:  v.recommendationNotes  || null,
    };
    this.svc.upsert(this.processId(), this.candidateId(), payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.analysis.set(updated);
          this.isSaving.set(false);
          this.isEditMode.set(false);
        },
        error: err => {
          this.isSaving.set(false);
          this.saveError.set(err?.error?.message ?? 'Error al guardar el análisis.');
        },
      });
  }

  // ── Documentos ────────────────────────────────────────────────────────────
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.isUploading.set(true);
    this.uploadError.set('');
    this.svc.uploadDocument(this.processId(), this.candidateId(), file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: doc => {
          this.analysis.update(a => a
            ? { ...a, documents: [...a.documents, doc] }
            : null
          );
          this.isUploading.set(false);
          (event.target as HTMLInputElement).value = '';
        },
        error: err => {
          this.isUploading.set(false);
          this.uploadError.set(err?.error?.message ?? 'Error al subir el archivo.');
          (event.target as HTMLInputElement).value = '';
        },
      });
  }

  deleteDoc(doc: HRAnalysisDoc): void {
    this.svc.deleteDocument(this.processId(), this.candidateId(), doc.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.analysis.update(a => a
            ? { ...a, documents: a.documents.filter(d => d.id !== doc.id) }
            : null
          );
          if (this.previewDoc()?.id === doc.id) {
            this.previewDoc.set(null);
            this.previewUrl.set(null);
          }
        },
      });
  }

  // ── Vista previa ──────────────────────────────────────────────────────────
  previewDocument(doc: HRAnalysisDoc): void {
    if (this.previewDoc()?.id === doc.id) {
      this.previewDoc.set(null);
      this.previewUrl.set(null);
      return;
    }
    this.previewLoading.set(true);
    this.previewDoc.set(doc);
    this.previewUrl.set(null);
    this.svc.getDocumentUrl(this.processId(), this.candidateId(), doc.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: url => {
          const isPdf = doc.mimeType === 'application/pdf';
          if (isPdf) {
            this.previewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
          } else {
            // Word: abrir en Office Online viewer
            const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
            window.open(viewerUrl, '_blank', 'noopener');
            this.previewDoc.set(null);
          }
          this.previewLoading.set(false);
        },
        error: () => {
          this.previewLoading.set(false);
          this.previewDoc.set(null);
        },
      });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  isPdf(doc: HRAnalysisDoc): boolean {
    return doc.mimeType === 'application/pdf';
  }

  fileIcon(doc: HRAnalysisDoc): string {
    if (doc.mimeType === 'application/pdf') return 'picture_as_pdf';
    if (doc.mimeType.includes('word') || doc.name.endsWith('.docx') || doc.name.endsWith('.doc')) return 'description';
    return 'attach_file';
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  sectionValue(key: keyof UpsertHRAnalysisPayload): string {
    const a = this.analysis();
    return (a as any)?.[key] ?? '';
  }
}

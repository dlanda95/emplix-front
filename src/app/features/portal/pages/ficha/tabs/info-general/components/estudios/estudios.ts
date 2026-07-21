import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AppInput, AppSelect, Badge, Button, ConfirmModal, EmptyState,
  ColGrid, ListItem, LoadingSkeleton, Modal, PageHeader, SectionCard,
} from '@shared/ui';
import { ToolbarLayout } from '@shared/layout';
import { EducationService } from '@features/portal/services/education.service';
import {
  Education, EducationPayload, EDUCATION_STATUS_OPTIONS, EDUCATION_STATUS_VARIANT,
} from '@features/portal/models/education.model';
import { ACADEMIC_LEVEL_OPTIONS, catalogLabel } from '@features/portal/models/catalog.model';

@Component({
  selector: 'app-estudios',
  imports: [
    CommonModule, ReactiveFormsModule,
    AppInput, AppSelect, Badge, Button, ConfirmModal, EmptyState,
    ColGrid, ListItem, LoadingSkeleton, Modal, PageHeader, SectionCard, ToolbarLayout,
  ],
  templateUrl: './estudios.html',
})
export class Estudios {
  private readonly fb      = inject(FormBuilder);
  private readonly service = inject(EducationService);

  readonly records         = signal<Education[] | undefined>(undefined);
  readonly isModalOpen     = signal(false);
  readonly isSubmitting    = signal(false);
  readonly isConfirmOpen   = signal(false);
  readonly editingRecord   = signal<Education | undefined>(undefined);
  readonly pendingDeleteId = signal<string | undefined>(undefined);

  readonly levelOptions  = ACADEMIC_LEVEL_OPTIONS;
  readonly statusOptions = EDUCATION_STATUS_OPTIONS;

  form: FormGroup = this.fb.group({
    level:       ['', Validators.required],
    institution: ['', Validators.required],
    program:     ['', Validators.required],
    startYear:   ['', [Validators.required, Validators.min(1950), Validators.max(2100)]],
    endYear:     [''],
    status:      ['COMPLETED', Validators.required],
    country:     ['Perú'],
  });

  constructor() { this.load(); }

  get modalTitle(): string {
    return this.editingRecord() ? 'Editar estudio' : 'Agregar estudio';
  }

  openAdd(): void {
    this.editingRecord.set(undefined);
    this.form.reset({ status: 'COMPLETED', country: 'Perú' });
    this.isModalOpen.set(true);
  }

  openEdit(rec: Education): void {
    this.editingRecord.set(rec);
    this.form.patchValue({
      level:       rec.level,
      institution: rec.institution,
      program:     rec.program,
      startYear:   rec.startYear,
      endYear:     rec.endYear ?? '',
      status:      rec.status,
      country:     rec.country ?? 'Perú',
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingRecord.set(undefined);
    this.form.reset({ status: 'COMPLETED', country: 'Perú' });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);

    const v = this.form.value;
    const payload: EducationPayload = {
      level:       v.level,
      institution: v.institution,
      program:     v.program,
      startYear:   Number(v.startYear),
      endYear:     v.endYear ? Number(v.endYear) : null,
      status:      v.status,
      country:     v.country || null,
    };

    const editing = this.editingRecord();
    const obs$    = editing
      ? this.service.update(editing.id, payload)
      : this.service.create(payload);

    obs$.subscribe({
      next: () => { this.load(); this.isSubmitting.set(false); this.closeModal(); },
      error: ()  => this.isSubmitting.set(false),
    });
  }

  requestDelete(id: string): void {
    this.pendingDeleteId.set(id);
    this.isConfirmOpen.set(true);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.isConfirmOpen.set(false);
    this.service.delete(id).subscribe({
      next: () => {
        this.records.update(list => list?.filter(r => r.id !== id));
        this.pendingDeleteId.set(undefined);
      },
    });
  }

  cancelDelete(): void {
    this.isConfirmOpen.set(false);
    this.pendingDeleteId.set(undefined);
  }

  levelLabel(val: string): string {
    return catalogLabel(ACADEMIC_LEVEL_OPTIONS, val);
  }

  statusLabel(val: string): string {
    return EDUCATION_STATUS_OPTIONS.find(o => o.value === val)?.label ?? val;
  }

  statusVariant(val: string): 'success' | 'warning' | 'error' | 'neutral' | 'primary' {
    return (EDUCATION_STATUS_VARIANT[val] as any) ?? 'neutral';
  }

  yearRange(rec: Education): string {
    const end = rec.endYear ? String(rec.endYear) : 'Presente';
    return `${rec.startYear} – ${end}`;
  }

  private load(): void {
    this.records.set(undefined);
    this.service.getAll().subscribe({
      next:  records => this.records.set(records),
      error: ()       => this.records.set([]),
    });
  }
}

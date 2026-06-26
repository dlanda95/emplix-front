import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppInput, AppSelect, Badge, Banner, Button, EmptyState, LoadingSkeleton, Modal, SectionCard } from '@shared/ui';
import { CandidatesService, CandidateSummary } from '../../services/candidates.service';
import { DOCUMENT_TYPE_OPTIONS } from '@features/portal/models/catalog.model';

@Component({
  selector: 'app-candidates-list',
  imports: [CommonModule, ReactiveFormsModule, AppInput, AppSelect, Badge, Banner, Button, EmptyState, LoadingSkeleton, Modal, SectionCard],
  templateUrl: './candidates-list.html',
  styleUrl: './candidates-list.scss',
})
export class CandidatesList implements OnInit {
  private readonly svc    = inject(CandidatesService);
  private readonly router = inject(Router);
  private readonly fb     = inject(FormBuilder);

  readonly candidates   = signal<CandidateSummary[]>([]);
  readonly isLoading    = signal(true);
  readonly isModalOpen  = signal(false);
  readonly isCreating   = signal(false);
  readonly createError  = signal('');

  readonly documentTypes = DOCUMENT_TYPE_OPTIONS;

  form = this.fb.group({
    firstName:    ['', Validators.required],
    lastName:     ['', Validators.required],
    middleName:   [''],
    documentType: ['DNI', Validators.required],
    documentId:   ['', Validators.required],
    hireDate:     ['', Validators.required],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading.set(true);
    this.svc.list().subscribe({
      next: list => { this.candidates.set(list); this.isLoading.set(false); },
      error: ()  => this.isLoading.set(false),
    });
  }

  openCreate(): void  { this.isModalOpen.set(true); this.form.reset({ documentType: 'DNI' }); }
  closeCreate(): void { this.isModalOpen.set(false); this.createError.set(''); }

  createCandidate(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isCreating.set(true);
    this.createError.set('');
    this.svc.create(this.form.value as any).subscribe({
      next: () => { this.isCreating.set(false); this.closeCreate(); this.load(); },
      error: (err) => { this.isCreating.set(false); this.createError.set(err?.error?.message ?? 'Error al registrar el candidato.'); },
    });
  }

  openDetail(id: string): void { this.router.navigate(['/admin/candidatos', id]); }

  statusLabel(status: string | null | undefined): string {
    return status === 'DOCS_SUBMITTED' ? 'Docs. Enviados'
         : status === 'COMPLETED'      ? 'Completado'
         : 'Pendiente de docs.';
  }

  statusVariant(status: string | null | undefined): 'success' | 'warning' | 'neutral' {
    return status === 'DOCS_SUBMITTED' ? 'success'
         : status === 'COMPLETED'      ? 'neutral'
         : 'warning';
  }
}

import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppInput, AppSelect, Badge, Banner, Button, EmptyState, LoadingSkeleton, Modal, SectionCard } from '@shared/ui';
import { CandidatesService, CandidateSummary } from '../../services/candidates.service';
import { OnboardingLabelPipe, OnboardingVariantPipe } from '../onboarding-status.pipe';
import { DOCUMENT_TYPE_OPTIONS } from '@features/portal/models/catalog.model';
import { PermissionsService } from '@core/auth/permissions.service';

@Component({
  selector: 'app-candidates-list',
  imports: [CommonModule, ReactiveFormsModule, AppInput, AppSelect, Badge, Banner, Button, EmptyState, LoadingSkeleton, Modal, SectionCard, OnboardingLabelPipe, OnboardingVariantPipe],
  templateUrl: './candidates-list.html',
  styleUrl: './candidates-list.scss',
})
export class CandidatesList implements OnInit {
  private readonly svc        = inject(CandidatesService);
  private readonly router     = inject(Router);
  private readonly fb         = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  readonly perms              = inject(PermissionsService);

  readonly candidates   = signal<CandidateSummary[]>([]);
  readonly isLoading    = signal(true);
  readonly loadError    = signal('');
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
    this.svc.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:  list => { this.candidates.set(list); this.isLoading.set(false); },
      error: err  => { this.isLoading.set(false); this.loadError.set(err?.error?.message ?? 'Error al cargar los candidatos.'); },
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
}

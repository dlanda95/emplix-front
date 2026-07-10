import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { dateRangeValidator } from '@shared/validators/date-range.validator';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import {
  AppInput, AppSelect, Badge, Banner, Button, EmptyState,
  LoadingSkeleton, Modal, Pagination, SectionCard,
} from '@shared/ui';
import { CandidatesService, CandidateSummary } from '../../services/candidates.service';
import { OnboardingLabelPipe, OnboardingVariantPipe } from '../onboarding-status.pipe';
import { DOCUMENT_TYPE_OPTIONS } from '@features/portal/models/catalog.model';
import { PermissionsService } from '@core/auth/permissions.service';
import { ToastService } from '@core/services/toast.service';
import type { SelectOption } from '@shared/ui';

const PAGE_SIZE = 25;
const TODAY = new Date().toISOString().slice(0, 10);

const ONBOARDING_OPTIONS: SelectOption[] = [
  { value: '',           label: 'Todos los estados' },
  { value: 'PENDING',   label: 'Pendiente' },
  { value: 'DOCS_SUBMITTED', label: 'Documentos enviados' },
  { value: 'COMPLETED', label: 'Completado' },
];

@Component({
  selector: 'app-candidates-list',
  imports: [
    CommonModule, ReactiveFormsModule,
    AppInput, AppSelect, Badge, Banner, Button, EmptyState,
    LoadingSkeleton, Modal, Pagination, SectionCard,
    OnboardingLabelPipe, OnboardingVariantPipe,
  ],
  templateUrl: './candidates-list.html',
})
export class CandidatesList implements OnInit {
  private readonly svc        = inject(CandidatesService);
  private readonly router     = inject(Router);
  private readonly fb         = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast      = inject(ToastService);
  readonly perms              = inject(PermissionsService);

  readonly candidates    = signal<CandidateSummary[]>([]);
  readonly total         = signal(0);
  readonly totalPages    = signal(1);
  readonly page          = signal(1);
  readonly pageSize      = PAGE_SIZE;
  readonly isLoading     = signal(true);
  readonly loadError     = signal('');

  readonly isModalOpen   = signal(false);
  readonly isCreating    = signal(false);
  readonly createError   = signal('');

  readonly searchCtrl    = new FormControl('');
  readonly statusCtrl    = new FormControl('');
  readonly onboardingOptions = ONBOARDING_OPTIONS;
  readonly documentTypes     = DOCUMENT_TYPE_OPTIONS;

  form = this.fb.group({
    firstName:    ['', Validators.required],
    lastName:     ['', Validators.required],
    middleName:   [''],
    documentType: ['DNI', Validators.required],
    documentId:   ['', Validators.required],
    hireDate:     [TODAY, [Validators.required, dateRangeValidator]],
  });

  ngOnInit(): void {
    this.searchCtrl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => { this.page.set(1); this.load(); });

    this.statusCtrl.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => { this.page.set(1); this.load(); });

    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.svc.list({
      page:             this.page(),
      limit:            PAGE_SIZE,
      search:           this.searchCtrl.value ?? '',
      onboardingStatus: this.statusCtrl.value ?? '',
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        this.candidates.set(result.data);
        this.total.set(result.total);
        this.totalPages.set(result.totalPages);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        this.loadError.set(err?.error?.message ?? 'Error al cargar los candidatos.');
      },
    });
  }

  onPageChange(p: number): void { this.page.set(p); this.load(); }

  openCreate(): void  { this.isModalOpen.set(true); this.form.reset({ documentType: 'DNI', hireDate: TODAY }); }
  closeCreate(): void { this.isModalOpen.set(false); this.createError.set(''); }

  createCandidate(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isCreating.set(true);
    this.createError.set('');
    this.svc.create(this.form.value as any).subscribe({
      next: () => {
        this.isCreating.set(false);
        this.closeCreate();
        this.page.set(1);
        this.load();
        this.toast.success('Candidato registrado correctamente.');
      },
      error: err => {
        this.isCreating.set(false);
        this.createError.set(err?.error?.message ?? 'Error al registrar el candidato.');
      },
    });
  }

  openDetail(id: string): void { this.router.navigate(['/admin/candidatos', id]); }
}

import { Component, DestroyRef, ViewChild, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import {
  AppInput, AppSelect, Badge, Banner, Button, EmptyState,
  LoadingSkeleton, Pagination, PageHeader, SectionCard, DataTable,
  CreateCandidateModal,
} from '@shared/ui';
import { CandidatesService, CandidateSummary, CreateCandidateResult } from '../../services/candidates.service';
import { OnboardingLabelPipe, OnboardingVariantPipe } from '../onboarding-status.pipe';
import { PermissionsService } from '@core/auth/permissions.service';
import type { SelectOption } from '@shared/ui';

const PAGE_SIZE = 25;

const ONBOARDING_OPTIONS: SelectOption[] = [
  { value: '',                label: 'Todos los estados'   },
  { value: 'PENDING_DOCS',   label: 'Docs. Pendientes'     },
  { value: 'DOCS_SUBMITTED', label: 'Documentos enviados'  },
  { value: 'COMPLETED',      label: 'Completado'           },
];

@Component({
  selector: 'app-candidates-list',
  imports: [
    CommonModule, ReactiveFormsModule,
    AppInput, AppSelect, Badge, Banner, Button, EmptyState,
    LoadingSkeleton, Pagination, PageHeader, SectionCard, DataTable,
    OnboardingLabelPipe, OnboardingVariantPipe,
    CreateCandidateModal,
  ],
  templateUrl: './candidates-list.html',
  host: { style: 'display:block' },
})
export class CandidatesList implements OnInit {
  @ViewChild(CreateCandidateModal) private createCandidateModal!: CreateCandidateModal;

  private readonly svc        = inject(CandidatesService);
  private readonly router     = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly perms              = inject(PermissionsService);

  readonly candidates    = signal<CandidateSummary[]>([]);
  readonly total         = signal(0);
  readonly totalPages    = signal(1);
  readonly page          = signal(1);
  readonly pageSize      = PAGE_SIZE;
  readonly isLoading     = signal(true);
  readonly loadError     = signal('');

  readonly searchCtrl        = new FormControl('');
  readonly statusCtrl        = new FormControl('');
  readonly onboardingOptions = ONBOARDING_OPTIONS;

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

  openRegisterCandidate(): void {
    this.createCandidateModal.open();
  }

  onCandidateRegistered(_result: CreateCandidateResult): void {
    this.page.set(1);
    this.load();
  }

  onPageChange(p: number): void { this.page.set(p); this.load(); }

  openDetail(id: string): void { this.router.navigate(['/admin/candidatos', id]); }
}

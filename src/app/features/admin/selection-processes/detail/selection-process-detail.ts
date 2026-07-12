import { Component, DestroyRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import {
  AdminPageLayout, AppInput, AppSelect, Badge, Banner, Button, DataTable, EmptyState,
  LoadingSkeleton, Modal, Pagination, SectionCard,
  CreateCandidateModal,
} from '@shared/ui';
import { SelectionProcessesService, SelectionProcess } from '../../services/selection-processes.service';
import { CandidatesService, CandidateSummary, CreateCandidateResult } from '../../services/candidates.service';
import {
  ApprovalsService,
  CandidateApprovalsResponse,
  SubmitApprovalPayload,
} from '../../services/approvals.service';
import { PermissionsService } from '@core/auth/permissions.service';
import { AuthService } from '@core/auth/auth';
import { isHR } from '@core/auth/models/user.model';
import { OnboardingLabelPipe, OnboardingVariantPipe } from '../../candidates/onboarding-status.pipe';
import {
  SelectionProcessStatusLabelPipe,
  SelectionProcessStatusVariantPipe,
} from '../selection-process-status.pipe';
import type { SelectOption } from '@shared/ui';

const PAGE_SIZE = 25;

const ONBOARDING_OPTIONS: SelectOption[] = [
  { value: '',                label: 'Todos los estados'  },
  { value: 'PENDING_DOCS',   label: 'Docs. Pendientes'    },
  { value: 'DOCS_SUBMITTED', label: 'Docs. Enviados'      },
  { value: 'COMPLETED',      label: 'Completado'          },
];

const PROCESS_STATUS_OPTIONS: SelectOption[] = [
  { value: 'OPEN',      label: 'Activo'     },
  { value: 'CLOSED',    label: 'Cerrado'    },
  { value: 'CANCELLED', label: 'Cancelado'  },
];

@Component({
  selector: 'app-selection-process-detail',
  imports: [
    CommonModule, ReactiveFormsModule,
    AdminPageLayout, AppInput, AppSelect, Badge, Banner, Button, DataTable, EmptyState,
    LoadingSkeleton, Modal, Pagination, SectionCard,
    CreateCandidateModal,
    OnboardingLabelPipe, OnboardingVariantPipe,
    SelectionProcessStatusLabelPipe, SelectionProcessStatusVariantPipe,
  ],
  templateUrl: './selection-process-detail.html',
  host: { style: 'display:block' },
})
export class SelectionProcessDetail implements OnInit {
  @ViewChild(CreateCandidateModal) private createCandidateModal!: CreateCandidateModal;

  private readonly svc            = inject(SelectionProcessesService);
  private readonly candidatesSvc  = inject(CandidatesService);
  private readonly approvalsSvc   = inject(ApprovalsService);
  private readonly route          = inject(ActivatedRoute);
  private readonly router         = inject(Router);
  private readonly fb             = inject(FormBuilder);
  private readonly destroyRef     = inject(DestroyRef);
  private readonly auth           = inject(AuthService);
  readonly perms                  = inject(PermissionsService);

  // Role helpers
  get currentUserId(): string { return this.auth.currentUser()?.id ?? ''; }
  get isHRUser(): boolean     { return isHR(this.auth.currentUser()?.role); }

  // ── Proceso ────────────────────────────────────────────────────────────────
  readonly process       = signal<SelectionProcess | null>(null);
  readonly candidates    = signal<CandidateSummary[]>([]);
  readonly total         = signal(0);
  readonly page          = signal(1);
  readonly pageSize      = PAGE_SIZE;
  readonly isLoading     = signal(true);
  readonly loadError     = signal('');

  // ── Modal: editar proceso ──────────────────────────────────────────────────
  readonly isEditModalOpen = signal(false);
  readonly isSaving        = signal(false);
  readonly saveError       = signal('');

  readonly searchCtrl        = new FormControl('');
  readonly statusCtrl        = new FormControl('');
  readonly onboardingOptions = ONBOARDING_OPTIONS;
  readonly processStatusOptions = PROCESS_STATUS_OPTIONS;

  readonly editForm = this.fb.group({
    description: ['', Validators.maxLength(500)],
    status:      ['OPEN', Validators.required],
  });

  // ── Modal: aprobaciones de candidato ──────────────────────────────────────
  readonly isApprovalModalOpen    = signal(false);
  readonly approvalData           = signal<CandidateApprovalsResponse | null>(null);
  readonly isLoadingApprovals     = signal(false);
  readonly approvalError          = signal('');
  readonly isSubmittingApproval   = signal(false);
  readonly isConverting           = signal(false);
  readonly convertError           = signal('');

  readonly approvalCommentCtrl = new FormControl('');

  private selectedCandidateId = '';

  private get processId(): string {
    return this.route.snapshot.paramMap.get('id') ?? '';
  }

  ngOnInit(): void {
    if (!this.processId) { this.router.navigate(['/admin/procesos-seleccion']); return; }

    this.searchCtrl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => { this.page.set(1); this.loadCandidates(); });

    this.statusCtrl.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => { this.page.set(1); this.loadCandidates(); });

    this.loadProcess();
    this.loadCandidates();
  }

  loadProcess(): void {
    this.svc.get(this.processId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:  p  => this.process.set(p),
      error: () => this.router.navigate(['/admin/procesos-seleccion']),
    });
  }

  loadCandidates(): void {
    this.isLoading.set(true);
    this.svc.listCandidates(this.processId, {
      page:             this.page(),
      limit:            PAGE_SIZE,
      search:           this.searchCtrl.value ?? '',
      onboardingStatus: this.statusCtrl.value ?? '',
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        this.candidates.set(result.data);
        this.total.set(result.total);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        this.loadError.set(err?.error?.message ?? 'Error al cargar los candidatos.');
      },
    });
  }

  // ── Aprobaciones ──────────────────────────────────────────────────────────

  openApprovalModal(candidateId: string): void {
    this.selectedCandidateId = candidateId;
    this.approvalData.set(null);
    this.approvalError.set('');
    this.convertError.set('');
    this.approvalCommentCtrl.reset('');
    this.isApprovalModalOpen.set(true);
    this.loadApprovals();
  }

  closeApprovalModal(): void {
    this.isApprovalModalOpen.set(false);
    this.selectedCandidateId = '';
  }

  loadApprovals(): void {
    if (!this.selectedCandidateId) return;
    this.isLoadingApprovals.set(true);
    this.approvalsSvc.getCandidateApprovals(this.processId, this.selectedCandidateId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => { this.approvalData.set(data); this.isLoadingApprovals.set(false); },
        error: err => {
          this.isLoadingApprovals.set(false);
          this.approvalError.set(err?.error?.message ?? 'Error al cargar las aprobaciones.');
        },
      });
  }

  submitApproval(status: 'APPROVED' | 'REJECTED'): void {
    this.isSubmittingApproval.set(true);
    this.approvalError.set('');
    const payload: SubmitApprovalPayload = {
      status,
      comment: this.approvalCommentCtrl.value?.trim() || undefined,
    };
    this.approvalsSvc.submitApproval(this.processId, this.selectedCandidateId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmittingApproval.set(false);
          this.approvalCommentCtrl.reset('');
          this.loadApprovals();
        },
        error: err => {
          this.isSubmittingApproval.set(false);
          this.approvalError.set(err?.error?.message ?? 'Error al registrar la aprobación.');
        },
      });
  }

  convertToEmployee(): void {
    if (!confirm('¿Confirmas convertir este candidato en colaborador activo?')) return;
    this.isConverting.set(true);
    this.convertError.set('');
    this.approvalsSvc.convertToEmployee(this.processId, this.selectedCandidateId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isConverting.set(false);
          this.closeApprovalModal();
          this.page.set(1);
          this.loadCandidates();
          this.loadProcess();
        },
        error: err => {
          this.isConverting.set(false);
          this.convertError.set(err?.error?.message ?? 'Error al convertir el candidato.');
        },
      });
  }

  // Checks if the current user is an approver in this process and hasn't approved yet
  canApproveAsApprover(data: CandidateApprovalsResponse): boolean {
    return data.approverLines.some(l => l.isCurrentUser);
  }

  myApprovalLine(data: CandidateApprovalsResponse) {
    return data.approverLines.find(l => l.isCurrentUser) ?? null;
  }

  // ── Editar proceso ─────────────────────────────────────────────────────────

  openAddCandidate(): void {
    this.createCandidateModal.open();
  }

  onCandidateRegistered(_result: CreateCandidateResult): void {
    this.page.set(1);
    this.loadCandidates();
    this.loadProcess();
  }

  openEditProcess(): void {
    const p = this.process();
    if (!p) return;
    this.editForm.reset({ description: p.description ?? '', status: p.status });
    this.saveError.set('');
    this.isEditModalOpen.set(true);
  }

  closeEditProcess(): void { this.isEditModalOpen.set(false); }

  saveProcess(): void {
    if (this.editForm.invalid) { this.editForm.markAllAsTouched(); return; }
    this.isSaving.set(true);
    this.saveError.set('');
    this.svc.update(this.processId, this.editForm.value as any).subscribe({
      next: updated => {
        this.process.set(updated);
        this.isSaving.set(false);
        this.closeEditProcess();
      },
      error: err => {
        this.isSaving.set(false);
        this.saveError.set(err?.error?.message ?? 'Error al guardar los cambios.');
      },
    });
  }

  onPageChange(p: number): void { this.page.set(p); this.loadCandidates(); }

  openCandidateDetail(candidateId: string): void {
    this.router.navigate(['/admin/candidatos', candidateId]);
  }

  back(): void { this.router.navigate(['/admin/procesos-seleccion']); }
}

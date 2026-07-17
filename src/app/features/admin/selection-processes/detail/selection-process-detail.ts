import { Component, DestroyRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import {
  AdminPageLayout, AppInput, AppSelect, Badge, Banner, Button, DataTable, EmptyState,
  LoadingSkeleton, Modal, Pagination, SectionCard,
  CreateCandidateModal, HRAnalysisPanel, CandidateComparisonPanel,
} from '@shared/ui';
import { SelectionProcessesService, SelectionProcess } from '../../services/selection-processes.service';
import { CandidatesService, CandidateSummary, CreateCandidateResult, DeptWithPositions, EmployeeMinimal } from '../../services/candidates.service';
import { HRAnalysisService, HRAnalysis } from '../../services/hr-analysis.service';
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
import { forkJoin } from 'rxjs';

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
    CreateCandidateModal, HRAnalysisPanel, CandidateComparisonPanel,
    OnboardingLabelPipe, OnboardingVariantPipe,
    SelectionProcessStatusLabelPipe, SelectionProcessStatusVariantPipe,
  ],
  templateUrl: './selection-process-detail.html',
  host: { style: 'display:block' },
})
export class SelectionProcessDetail implements OnInit {
  @ViewChild(CreateCandidateModal) private createCandidateModal!: CreateCandidateModal;
  @ViewChild(HRAnalysisPanel) private hrPanel!: HRAnalysisPanel;

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

  private readonly hrAnalysisSvc = inject(HRAnalysisService);

  // ── Proceso ────────────────────────────────────────────────────────────────
  readonly process          = signal<SelectionProcess | null>(null);
  readonly candidates       = signal<CandidateSummary[]>([]);
  readonly total            = signal(0);
  readonly page             = signal(1);
  readonly pageSize         = PAGE_SIZE;
  readonly isLoading        = signal(true);
  readonly loadError        = signal('');
  readonly viewMode         = signal<'list' | 'compare'>('list');
  readonly processAnalyses  = signal<HRAnalysis[]>([]);
  readonly analysesLoading  = signal(false);

  // ── Modal: editar proceso ──────────────────────────────────────────────────
  readonly isEditModalOpen = signal(false);
  readonly isSaving        = signal(false);
  readonly saveError       = signal('');

  readonly searchCtrl        = new FormControl('');
  readonly statusCtrl        = new FormControl('');
  readonly onboardingOptions = ONBOARDING_OPTIONS;
  readonly processStatusOptions = PROCESS_STATUS_OPTIONS;

  // Controles del formulario de edición (cascade: área → subárea → puesto)
  private readonly editAreaCtrl    = new FormControl('', Validators.required);
  private readonly editSubareaCtrl = new FormControl('');

  readonly editForm = this.fb.group({
    description: ['', Validators.maxLength(500)],
    areaId:      this.editAreaCtrl,
    subareaId:   this.editSubareaCtrl,
    positionId:  ['', Validators.required],
    status:      ['OPEN', Validators.required],
  });

  // Datos maestros org (para selects de edición)
  readonly depts        = signal<DeptWithPositions[]>([]);
  readonly allEmployees = signal<EmployeeMinimal[]>([]);

  // Signals reactivos del cascade de edición
  private readonly editAreaId = toSignal(
    this.editAreaCtrl.valueChanges.pipe(startWith('')),
    { initialValue: '' },
  );
  private readonly editSubareaId = toSignal(
    this.editSubareaCtrl.valueChanges.pipe(startWith('')),
    { initialValue: '' },
  );

  readonly editSelectedArea = computed<DeptWithPositions | null>(() =>
    this.depts().find(d => d.id === this.editAreaId()) ?? null
  );
  readonly editHasSubareas = computed(() =>
    (this.editSelectedArea()?.children?.length ?? 0) > 0
  );
  readonly editAreaOptions = computed<SelectOption[]>(() => [
    { value: '', label: '— Seleccionar área —' },
    ...this.depts().map(d => ({ value: d.id, label: d.name })),
  ]);
  readonly editSubareaOptions = computed<SelectOption[]>(() => {
    const area = this.editSelectedArea();
    if (!area?.children?.length) return [];
    return [
      { value: '', label: '— Directo en el área —' },
      ...area.children.map(c => ({ value: c.id, label: c.name })),
    ];
  });
  readonly editPositionOptions = computed<SelectOption[]>(() => {
    const area = this.editSelectedArea();
    if (!area) return [{ value: '', label: '— Primero selecciona un área —' }];
    const subareaId = this.editSubareaId();
    const positions = subareaId
      ? (area.children.find(c => c.id === subareaId)?.positions ?? [])
      : area.positions;
    if (!positions.length) return [{ value: '', label: '— Sin puestos disponibles —' }];
    return [
      { value: '', label: '— Seleccionar puesto —' },
      ...positions.map(p => ({ value: p.id, label: p.name })),
    ];
  });

  // Aprobadores del formulario de edición
  readonly editApprovers      = signal<EmployeeMinimal[]>([]);
  readonly editApproverSearch = new FormControl('');

  private readonly editApproverQuery = toSignal(
    this.editApproverSearch.valueChanges.pipe(startWith(''), debounceTime(150)),
    { initialValue: '' },
  );

  readonly editFilteredEmployees = computed<EmployeeMinimal[]>(() => {
    const q   = (this.editApproverQuery() ?? '').toLowerCase().trim();
    const ids = new Set(this.editApprovers().map(a => a.id));
    return this.allEmployees()
      .filter(e => !ids.has(e.id))
      .filter(e => !q ||
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        (e.position?.name?.toLowerCase().includes(q) ?? false),
      )
      .slice(0, 25);
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
  private _processId          = '';

  private get processCode(): string {
    return this.route.snapshot.paramMap.get('code') ?? '';
  }

  ngOnInit(): void {
    if (!this.processCode) { this.router.navigate(['/admin/procesos-seleccion']); return; }

    // Datos maestros para selects de edición
    forkJoin({
      depts:     this.candidatesSvc.listDepartments(),
      employees: this.candidatesSvc.listActiveEmployees(),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ depts, employees }) => {
      this.depts.set(depts);
      this.allEmployees.set(employees);
    });

    // Cascade: al cambiar área → reset subárea y puesto
    this.editAreaCtrl.valueChanges.pipe(
      distinctUntilChanged(), takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.editSubareaCtrl.setValue('', { emitEvent: false });
      this.editForm.patchValue({ positionId: '' });
    });

    // Cascade: al cambiar subárea → reset puesto
    this.editSubareaCtrl.valueChanges.pipe(
      distinctUntilChanged(), takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.editForm.patchValue({ positionId: '' }));

    this.searchCtrl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => { this.page.set(1); this.loadCandidates(); });

    this.statusCtrl.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => { this.page.set(1); this.loadCandidates(); });

    this.loadProcess();
  }

  loadProcess(): void {
    this.svc.getByCode(this.processCode).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: p => {
        this._processId = p.id;
        this.process.set(p);
        this.loadCandidates();
      },
      error: () => this.router.navigate(['/admin/procesos-seleccion']),
    });
  }

  loadCandidates(): void {
    if (!this._processId) return;
    this.isLoading.set(true);
    this.svc.listCandidates(this._processId, {
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
    this.approvalsSvc.getCandidateApprovals(this._processId, this.selectedCandidateId)
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
    this.approvalsSvc.submitApproval(this._processId, this.selectedCandidateId, payload)
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
    this.approvalsSvc.convertToEmployee(this._processId, this.selectedCandidateId)
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

    // Resolver área y subárea del departamento actual del proceso
    const dept = p.department;
    const areaId    = dept ? (dept.parent ? dept.parent.id : dept.id) : '';
    const subareaId = dept?.parent ? dept.id : '';

    this.editForm.reset({
      description: p.description ?? '',
      status:      p.status,
      areaId,
      subareaId,
      positionId:  p.position?.id ?? '',
    });

    // Pre-llenar aprobadores actuales del proceso
    this.editApprovers.set(p.approvers.map(a => a.employee));
    this.editApproverSearch.reset('');
    this.saveError.set('');
    this.isEditModalOpen.set(true);
  }

  closeEditProcess(): void { this.isEditModalOpen.set(false); }

  saveProcess(): void {
    if (this.editForm.invalid) { this.editForm.markAllAsTouched(); return; }
    if (this.editApprovers().length === 0) {
      this.saveError.set('Debe agregar al menos 1 aprobador al proceso.');
      return;
    }
    this.isSaving.set(true);
    this.saveError.set('');
    const raw = this.editForm.value;
    const payload = {
      description:  raw.description ?? null,
      status:       raw.status as any,
      departmentId: raw.subareaId || raw.areaId || undefined,
      positionId:   raw.positionId || undefined,
      approverIds:  this.editApprovers().map(a => a.id),
    };
    this.svc.update(this._processId, payload).subscribe({
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

  toggleEditApprover(emp: EmployeeMinimal): void {
    this.editApprovers.update(curr => {
      if (curr.length >= 5) return curr;
      return [...curr, emp];
    });
    this.editApproverSearch.reset('');
  }

  removeEditApprover(id: string): void {
    this.editApprovers.update(curr => curr.filter(a => a.id !== id));
  }

  onPageChange(p: number): void { this.page.set(p); this.loadCandidates(); }

  openCandidateDetail(candidateId: string): void {
    this.router.navigate(['/admin/procesos-seleccion', this.processCode, 'candidatos', candidateId]);
  }

  switchView(mode: 'list' | 'compare'): void {
    this.viewMode.set(mode);
    if (mode === 'compare' && this.processAnalyses().length === 0) {
      this.analysesLoading.set(true);
      this.hrAnalysisSvc.getForProcess(this._processId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: list => { this.processAnalyses.set(list); this.analysesLoading.set(false); },
          error: ()   => { this.analysesLoading.set(false); },
        });
    }
  }

  openAnalysisPanel(c: CandidateSummary): void {
    const name = `${c.firstName} ${c.lastName}`;
    this.hrPanel.open(this._processId, c.id, name, this.isHRUser);
  }

  back(): void { this.router.navigate(['/admin/procesos-seleccion']); }
}

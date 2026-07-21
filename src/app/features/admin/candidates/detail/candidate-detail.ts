import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, switchMap } from 'rxjs';
import { Badge, Banner, Button, Field, LoadingSkeleton, SectionCard, Modal, AppSelect, AppInput, AdminPageLayout } from '@shared/ui';
import { CandidateDocPanel } from '@shared/components/ui/candidate-doc-panel/candidate-doc-panel';
import { OnboardingLabelPipe, OnboardingVariantPipe } from '../onboarding-status.pipe';
import type { SelectOption } from '@shared/ui';
import { CandidatesService } from '../../services/candidates.service';
import type { CandidateDetail as CandidateDetailModel, DeptWithPositions, EmployeeMinimal } from '../../services/candidates.service';
import { ApprovalsService } from '../../services/approvals.service';
import {
  catalogLabel,
  DOCUMENT_TYPE_OPTIONS, GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, ACADEMIC_LEVEL_OPTIONS,
  AFP_TYPE_OPTIONS, AFP_ENTITY_OPTIONS,
} from '@features/portal/models/catalog.model';


@Component({
  selector: 'app-candidate-detail',
  imports: [CommonModule, ReactiveFormsModule, Badge, Banner, Button, Field, LoadingSkeleton, SectionCard, Modal, AppSelect, AppInput, OnboardingLabelPipe, OnboardingVariantPipe, AdminPageLayout, CandidateDocPanel],
  templateUrl: './candidate-detail.html',
  host: { style: 'display:block' },
})
export class CandidateDetail implements OnInit {
  private readonly svc          = inject(CandidatesService);
  private readonly approvalsSvc = inject(ApprovalsService);
  private readonly route        = inject(ActivatedRoute);
  private readonly nav          = inject(Router);
  private readonly fb           = inject(FormBuilder);
  private readonly destroyRef   = inject(DestroyRef);

  readonly candidate             = signal<CandidateDetailModel | null>(null);
  readonly isLoading             = signal(true);
  readonly isActivating          = signal(false);
  readonly activateError         = signal('');
  readonly isActivateModal       = signal(false);
  readonly hrSaved               = signal(false);
  readonly isEditingAssignment   = signal(false);
  readonly prefilledFromProcess  = signal(false);

  // Catálogos org
  readonly departments = signal<DeptWithPositions[]>([]);
  readonly employees   = signal<EmployeeMinimal[]>([]);

  // Estado UI del selector en cascada (no van al payload guardado)
  readonly uiAreaId    = signal<string>('');
  readonly uiSubareaId = signal<string>('');

  // URLs de documentos (cargadas asíncronamente)
  readonly docUrls = signal<Record<string, string>>({});

  // Estado de aprobaciones del proceso vinculado
  readonly fullyApproved = signal(false);

  hrForm = this.fb.group({
    areaId:       [''],   // UI only — no se envía al backend
    subareaId:    [''],   // UI only — no se envía al backend
    positionId:   [''],
    supervisorId: [''],
  });

  activateForm = this.fb.group({
    corporateEmail: [''],
  });

  // ── Opciones de selects ──────────────────────────────────────────────────────

  readonly deptOptions = computed<SelectOption[]>(() =>
    this.departments().map(d => ({ value: d.id, label: d.name }))
  );

  readonly selectedAreaHasSubareas = computed(() => {
    const area = this.departments().find(d => d.id === this.uiAreaId());
    return (area?.children?.length ?? 0) > 0;
  });

  // Cargo visible solo cuando ya se completó la selección previa
  readonly showPositionSelect = computed(() => {
    if (!this.uiAreaId()) return false;
    if (this.selectedAreaHasSubareas() && !this.uiSubareaId()) return false;
    return true;
  });

  readonly subareaOptions = computed<SelectOption[]>(() => {
    const area = this.departments().find(d => d.id === this.uiAreaId());
    return area?.children?.map(c => ({ value: c.id, label: c.name })) ?? [];
  });

  readonly positionOptions = computed<SelectOption[]>(() => {
    const subareaId = this.uiSubareaId();
    const areaId    = this.uiAreaId();
    if (!areaId) return [];

    const area = this.departments().find(d => d.id === areaId);
    if (subareaId) {
      const sub = area?.children?.find(c => c.id === subareaId);
      return sub?.positions?.map(p => ({ value: p.id, label: p.name })) ?? [];
    }
    return area?.positions?.map(p => ({ value: p.id, label: p.name })) ?? [];
  });

  readonly supervisorOptions = computed<SelectOption[]>(() =>
    this.employees().map(e => ({
      value: e.id,
      label: `${e.firstName} ${e.lastName}${e.position?.name ? ` — ${e.position.name}` : ''}`,
    }))
  );

  // ── Ciclo de vida ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const id          = this.route.snapshot.paramMap.get('candidateId');
    const processCode = this.route.snapshot.paramMap.get('code') ?? '';
    if (!id) { this.nav.navigate(['/admin/procesos-seleccion']); return; }

    // Subscripciones reactivas de cascada (usuario cambia el select)
    this.hrForm.get('areaId')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(areaId => {
        this.uiAreaId.set(areaId ?? '');
        this.uiSubareaId.set('');
        this.hrForm.patchValue({ subareaId: '', positionId: '' }, { emitEvent: false });
      });

    this.hrForm.get('subareaId')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(subareaId => {
        this.uiSubareaId.set(subareaId ?? '');
        this.hrForm.get('positionId')!.setValue('', { emitEvent: false });
      });

    // Cargar candidato + catálogos en paralelo
    forkJoin({
      candidate: this.svc.get(id),
      depts:     this.svc.listDepartments(),
      employees: this.svc.listActiveEmployees(),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ candidate, depts, employees }) => {
        this.departments.set(depts);
        this.employees.set(employees);
        this.candidate.set(candidate);
        this.isLoading.set(false);

        const hasAssignment = !!(candidate.department?.name || candidate.position?.name || candidate.supervisor);
        this.isEditingAssignment.set(!hasAssignment);

        const savedDeptId = candidate.department?.id ?? candidate.departmentId ?? '';
        const savedPosId  = candidate.position?.id   ?? candidate.positionId   ?? '';
        const savedSupId  = candidate.supervisor?.id  ?? candidate.supervisorId ?? '';

        if (savedDeptId || savedPosId) {
          // Ya tiene asignación manual: resolver si es área o subárea
          this._applyDeptToForm(savedDeptId, savedPosId, savedSupId, depts);
        } else if (candidate.selectionProcess) {
          // Sin asignación manual: pre-llenar desde el proceso de selección
          const sp = candidate.selectionProcess;
          const spDeptId = sp.department?.id ?? '';
          const spPosId  = sp.position?.id   ?? '';
          this._applyDeptToForm(spDeptId, spPosId, '', depts);
          if (spDeptId || spPosId) this.prefilledFromProcess.set(true);
        }

        // Cargar aprobaciones del proceso vinculado
        if (candidate.selectionProcess) {
          this.approvalsSvc
            .getCandidateApprovals(candidate.selectionProcess.id, candidate.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: data => this.fullyApproved.set(data.fullyApproved),
              error: () => {},
            });
        }

        // Cargar URLs de docs adjuntos
        for (const doc of candidate.documents ?? []) {
          this.svc.getDocUrl(doc.id).subscribe({
            next: url => this.docUrls.update(m => ({ ...m, [doc.id]: url })),
            error: () => {},
          });
        }
      },
      error: () => { this.isLoading.set(false); this.nav.navigate(['/admin/procesos-seleccion', processCode]); },
    });
  }

  // ── Acciones ─────────────────────────────────────────────────────────────────

  saveHrData(): void {
    const id = this.candidate()?.id;
    if (!id) return;
    const v = this.hrForm.getRawValue();
    const payload = {
      departmentId: v.subareaId || v.areaId || null,
      positionId:   v.positionId   || null,
      supervisorId: v.supervisorId || null,
    };
    this.svc.updateHrData(id, payload).pipe(
      switchMap(() => this.svc.get(id)),
    ).subscribe({
      next: full => {
        this.candidate.set(full);
        this.isEditingAssignment.set(false);
        this.hrSaved.set(true);
        setTimeout(() => this.hrSaved.set(false), 3000);
      },
    });
  }

  startEditAssignment(): void  { this.isEditingAssignment.set(true); }
  cancelEditAssignment(): void { this.isEditingAssignment.set(false); }

  openActivate(): void  { this.isActivateModal.set(true); this.activateError.set(''); }
  closeActivate(): void { this.isActivateModal.set(false); }

  confirmActivate(): void {
    const id    = this.candidate()?.id;
    const email = this.activateForm.value.corporateEmail?.trim();
    if (!id || !email) return;
    this.isActivating.set(true);
    this.activateError.set('');
    this.svc.activate(id, email).subscribe({
      next: () => {
        this.isActivating.set(false);
        this.closeActivate();
        this.nav.navigate(['/admin/candidatos']);
      },
      error: err => {
        this.isActivating.set(false);
        this.activateError.set(err?.error?.message ?? 'Error al activar el colaborador.');
      },
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  /** Muestra "Área" o "Área / Subárea" según el departamento del candidato */
  deptDisplayLabel(c: CandidateDetailModel): string {
    if (!c.department) return '—';
    if (c.department.parent) return `${c.department.parent.name} / ${c.department.name}`;
    return c.department.name;
  }

  /** Muestra el departamento del proceso de selección como breadcrumb */
  processDeptLabel(c: CandidateDetailModel): string {
    const d = c.selectionProcess?.department;
    if (!d) return '—';
    return d.parent ? `${d.parent.name} / ${d.name}` : d.name;
  }

  /** Resuelve si el deptId guardado es área o subárea y parchea el formulario */
  private _applyDeptToForm(
    deptId: string, posId: string, supId: string, depts: DeptWithPositions[],
  ): void {
    const isTopArea  = depts.find(d => d.id === deptId);
    const parentArea = !isTopArea && depts.find(d => d.children.some(c => c.id === deptId));

    if (isTopArea) {
      this.uiAreaId.set(deptId);
      this.hrForm.patchValue({ areaId: deptId, subareaId: '', positionId: posId, supervisorId: supId }, { emitEvent: false });
    } else if (parentArea) {
      this.uiAreaId.set(parentArea.id);
      this.uiSubareaId.set(deptId);
      this.hrForm.patchValue({ areaId: parentArea.id, subareaId: deptId, positionId: posId, supervisorId: supId }, { emitEvent: false });
    } else {
      this.hrForm.patchValue({ positionId: posId, supervisorId: supId }, { emitEvent: false });
    }
  }

  docTypeLabel(val: string | null | undefined): string {
    return catalogLabel(DOCUMENT_TYPE_OPTIONS, val);
  }

  genderLabel(val: string | null | undefined): string {
    return catalogLabel(GENDER_OPTIONS, val);
  }

  maritalStatusLabel(val: string | null | undefined): string {
    return catalogLabel(MARITAL_STATUS_OPTIONS, val);
  }

  academicLevelLabel(val: string | null | undefined): string {
    return catalogLabel(ACADEMIC_LEVEL_OPTIONS, val);
  }

  afpTypeLabel(val: string | null | undefined): string {
    return catalogLabel(AFP_TYPE_OPTIONS, val);
  }

  afpEntityLabel(val: string | null | undefined): string {
    return catalogLabel(AFP_ENTITY_OPTIONS, val);
  }

  get canActivate(): boolean {
    const c = this.candidate();
    if (!c) return false;
    const statusOk = c.onboardingStatus === 'DOCS_SUBMITTED' || c.onboardingStatus === 'COMPLETED';
    if (!statusOk) return false;
    if (c.selectionProcess) return this.fullyApproved();
    return true;
  }

  back(): void {
    const code = this.route.snapshot.paramMap.get('code') ?? '';
    this.nav.navigate(['/admin/procesos-seleccion', code]);
  }
}

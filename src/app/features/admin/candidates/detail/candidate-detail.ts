import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Badge, Banner, Button, Field, LoadingSkeleton, SectionCard, Modal, AppSelect, AppInput } from '@shared/ui';
import { OnboardingLabelPipe, OnboardingVariantPipe } from '../onboarding-status.pipe';
import type { SelectOption } from '@shared/ui';
import { CandidatesService } from '../../services/candidates.service';
import type { CandidateDetail as CandidateDetailModel, DeptWithPositions, EmployeeMinimal } from '../../services/candidates.service';
import {
  catalogLabel,
  DOCUMENT_TYPE_OPTIONS, GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, ACADEMIC_LEVEL_OPTIONS,
  AFP_TYPE_OPTIONS, AFP_ENTITY_OPTIONS,
} from '@features/portal/models/catalog.model';

const DOC_LABELS: { prefix: string; label: string }[] = [
  { prefix: 'DNI_CE',          label: 'Documento de Identidad'          },
  { prefix: 'CV_',             label: 'Currículum Vitae'                 },
  { prefix: 'RECIBO_DOMICILIO',label: 'Recibo de Servicios (Domicilio)' },
  { prefix: 'CONTRATO_',       label: 'Contrato'                        },
  { prefix: 'CERT_',           label: 'Certificado'                     },
];

@Component({
  selector: 'app-candidate-detail',
  imports: [CommonModule, ReactiveFormsModule, Badge, Banner, Button, Field, LoadingSkeleton, SectionCard, Modal, AppSelect, AppInput, OnboardingLabelPipe, OnboardingVariantPipe],
  templateUrl: './candidate-detail.html',
  styleUrl: './candidate-detail.scss',
})
export class CandidateDetail implements OnInit {
  private readonly svc        = inject(CandidatesService);
  private readonly route      = inject(ActivatedRoute);
  private readonly nav        = inject(Router);
  private readonly fb         = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly candidate      = signal<CandidateDetailModel | null>(null);
  readonly isLoading      = signal(true);
  readonly isActivating   = signal(false);
  readonly activateError  = signal('');
  readonly isActivateModal = signal(false);
  readonly hrSaved        = signal(false);

  // Catálogos org
  readonly departments = signal<DeptWithPositions[]>([]);
  readonly employees   = signal<EmployeeMinimal[]>([]);

  // Estado UI del selector en cascada (no van al payload guardado)
  readonly uiAreaId    = signal<string>('');
  readonly uiSubareaId = signal<string>('');

  // URLs de documentos (cargadas asíncronamente)
  readonly docUrls = signal<Record<string, string>>({});

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
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.nav.navigate(['/admin/candidatos']); return; }

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

        // Determinar si el departamento guardado es un área o subárea
        const savedDeptId = candidate.department?.id ?? candidate.departmentId ?? '';
        const savedPosId  = candidate.position?.id   ?? candidate.positionId   ?? '';
        const savedSupId  = candidate.supervisor?.id  ?? candidate.supervisorId ?? '';

        const isTopArea  = depts.find(d => d.id === savedDeptId);
        const parentArea = !isTopArea && depts.find(d => d.children.some(c => c.id === savedDeptId));

        if (isTopArea) {
          this.uiAreaId.set(savedDeptId);
          this.hrForm.patchValue({ areaId: savedDeptId, subareaId: '', positionId: savedPosId, supervisorId: savedSupId }, { emitEvent: false });
        } else if (parentArea) {
          this.uiAreaId.set(parentArea.id);
          this.uiSubareaId.set(savedDeptId);
          this.hrForm.patchValue({ areaId: parentArea.id, subareaId: savedDeptId, positionId: savedPosId, supervisorId: savedSupId }, { emitEvent: false });
        } else {
          this.hrForm.patchValue({ positionId: savedPosId, supervisorId: savedSupId }, { emitEvent: false });
        }

        // Cargar URLs de docs adjuntos
        for (const doc of candidate.documents ?? []) {
          this.svc.getDocUrl(doc.id).subscribe({
            next: url => this.docUrls.update(m => ({ ...m, [doc.id]: url })),
            error: () => {},
          });
        }
      },
      error: () => { this.isLoading.set(false); this.nav.navigate(['/admin/candidatos']); },
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
    this.svc.updateHrData(id, payload).subscribe({
      next: updated => {
        this.candidate.set(updated);
        this.hrSaved.set(true);
        setTimeout(() => this.hrSaved.set(false), 2500);
      },
    });
  }

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

  docLabel(doc: { name?: string; originalName?: string }): string {
    const upper = (doc.name ?? '').toUpperCase();
    const match = DOC_LABELS.find(d => upper.startsWith(d.prefix));
    return match?.label ?? doc.originalName ?? doc.name ?? 'Documento';
  }

  get canActivate(): boolean {
    const c = this.candidate();
    return c?.onboardingStatus === 'DOCS_SUBMITTED' || c?.onboardingStatus === 'COMPLETED';
  }

  back(): void { this.nav.navigate(['/admin/candidatos']); }
}

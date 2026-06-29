import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Badge, Banner, Button, Field, LoadingSkeleton, SectionCard, Modal, AppSelect, AppInput } from '@shared/ui';
import type { SelectOption } from '@shared/ui';
import { CandidatesService } from '../../services/candidates.service';
import type { DeptWithPositions, EmployeeMinimal } from '../../services/candidates.service';
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
  imports: [CommonModule, ReactiveFormsModule, Badge, Banner, Button, Field, LoadingSkeleton, SectionCard, Modal, AppSelect, AppInput],
  templateUrl: './candidate-detail.html',
  styleUrl: './candidate-detail.scss',
})
export class CandidateDetail implements OnInit {
  private readonly svc   = inject(CandidatesService);
  private readonly route = inject(ActivatedRoute);
  private readonly nav   = inject(Router);
  private readonly fb    = inject(FormBuilder);

  readonly candidate      = signal<any>(null);
  readonly isLoading      = signal(true);
  readonly isActivating   = signal(false);
  readonly activateError  = signal('');
  readonly isActivateModal = signal(false);
  readonly hrSaved        = signal(false);

  // Catálogos org
  readonly departments = signal<DeptWithPositions[]>([]);
  readonly employees   = signal<EmployeeMinimal[]>([]);

  // URLs de documentos (cargadas asíncronamente)
  readonly docUrls = signal<Record<string, string>>({});

  hrForm = this.fb.group({
    departmentId: [''],
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

  readonly positionOptions = computed<SelectOption[]>(() => {
    const deptId = this.hrForm.get('departmentId')?.value ?? '';
    const dept   = this.departments().find(d => d.id === deptId);
    return dept?.positions.map(p => ({ value: p.id, label: p.name })) ?? [];
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

    // Cargar catálogos en paralelo (no bloquean el render)
    this.svc.listDepartments().subscribe(d => this.departments.set(d));
    this.svc.listActiveEmployees().subscribe(e => this.employees.set(e));

    // Cargar candidato
    this.svc.get(id).subscribe({
      next: data => {
        this.candidate.set(data);
        this.isLoading.set(false);

        // Pre-rellenar asignación existente (sin disparar valueChanges innecesariamente)
        this.hrForm.patchValue({
          departmentId: data.department?.id  ?? data.departmentId  ?? '',
          positionId:   data.position?.id    ?? data.positionId    ?? '',
          supervisorId: data.supervisor?.id  ?? data.supervisorId  ?? '',
        }, { emitEvent: false });

        if (!this.hrForm.value.departmentId) {
          this.hrForm.get('positionId')?.disable();
        }

        // Cargar URLs de docs adjuntos
        for (const doc of data.documents ?? []) {
          this.svc.getDocUrl(doc.id).subscribe({
            next: url => this.docUrls.update(m => ({ ...m, [doc.id]: url })),
            error: () => {},
          });
        }
      },
      error: () => { this.isLoading.set(false); this.nav.navigate(['/admin/candidatos']); },
    });

    // Cascade: al cambiar área, habilitar/limpiar cargo
    this.hrForm.get('departmentId')?.valueChanges.subscribe(deptId => {
      const posCtrl = this.hrForm.get('positionId')!;
      posCtrl.setValue('', { emitEvent: false });
      deptId ? posCtrl.enable() : posCtrl.disable();
    });
  }

  // ── Acciones ─────────────────────────────────────────────────────────────────

  saveHrData(): void {
    const id = this.candidate()?.id;
    if (!id) return;
    this.svc.updateHrData(id, this.hrForm.getRawValue() as Record<string, unknown>).subscribe({
      next: updated => {
        this.candidate.update(c => ({ ...c, ...updated }));
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

  onboardingStatusLabel(val: string | null | undefined): string {
    return val === 'DOCS_SUBMITTED' ? 'Documentación enviada'
         : val === 'COMPLETED'      ? 'Completado'
         : 'Pendiente de documentación';
  }

  onboardingStatusVariant(val: string | null | undefined): 'success' | 'warning' | 'neutral' {
    return val === 'DOCS_SUBMITTED' ? 'success'
         : val === 'COMPLETED'      ? 'neutral'
         : 'warning';
  }

  back(): void { this.nav.navigate(['/admin/candidatos']); }
}

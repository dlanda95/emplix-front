import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import {
  AdminPageLayout, AppInput, AppSelect, Badge, Banner, Button, DataTable, EmptyState,
  LoadingSkeleton, Modal, PageHeader, Pagination, SectionCard,
} from '@shared/ui';
import { SelectionProcessesService, SelectionProcess } from '../../services/selection-processes.service';
import { CandidatesService, DeptWithPositions, EmployeeMinimal } from '../../services/candidates.service';
import { PermissionsService } from '@core/auth/permissions.service';
import {
  SelectionProcessStatusLabelPipe,
  SelectionProcessStatusVariantPipe,
} from '../selection-process-status.pipe';
import type { SelectOption } from '@shared/ui';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-selection-processes-list',
  imports: [
    CommonModule, ReactiveFormsModule,
    AdminPageLayout, AppInput, AppSelect, Badge, Banner, Button, DataTable, EmptyState,
    LoadingSkeleton, Modal, PageHeader, Pagination, SectionCard,
    SelectionProcessStatusLabelPipe, SelectionProcessStatusVariantPipe,
  ],
  templateUrl: './selection-processes-list.html',
  host: { style: 'display:block' },
})
export class SelectionProcessesList implements OnInit {
  private readonly svc          = inject(SelectionProcessesService);
  private readonly candidatesSvc= inject(CandidatesService);
  private readonly router       = inject(Router);
  private readonly fb           = inject(FormBuilder);
  private readonly destroyRef   = inject(DestroyRef);
  readonly perms                = inject(PermissionsService);

  // ── Lista ──────────────────────────────────────────────────────────────────
  readonly processes   = signal<SelectionProcess[]>([]);
  readonly total       = signal(0);
  readonly page        = signal(1);
  readonly pageSize    = PAGE_SIZE;
  readonly isLoading   = signal(true);
  readonly loadError   = signal('');
  readonly searchCtrl  = new FormControl('');

  // ── Datos para el formulario ───────────────────────────────────────────────
  readonly depts        = signal<DeptWithPositions[]>([]);
  readonly allEmployees = signal<EmployeeMinimal[]>([]);

  // ── Modal: crear proceso ───────────────────────────────────────────────────
  readonly isCreateModalOpen = signal(false);
  readonly isCreating        = signal(false);
  readonly createError       = signal('');

  // Controles del formulario de creación (cascade: área → subárea → puesto)
  private readonly areaIdCtrl    = new FormControl('', Validators.required);
  private readonly subareaIdCtrl = new FormControl('');

  readonly createForm = this.fb.group({
    description: ['', Validators.maxLength(500)],
    areaId:      this.areaIdCtrl,
    subareaId:   this.subareaIdCtrl,
    positionId:  ['', Validators.required],
  });

  // Signals reactivos desde los controles
  private readonly selectedAreaId = toSignal(
    this.areaIdCtrl.valueChanges.pipe(startWith('')),
    { initialValue: '' },
  );
  private readonly selectedSubareaId = toSignal(
    this.subareaIdCtrl.valueChanges.pipe(startWith('')),
    { initialValue: '' },
  );

  // Área actualmente seleccionada (objeto completo)
  readonly selectedArea = computed<DeptWithPositions | null>(() => {
    const id = this.selectedAreaId();
    return this.depts().find(d => d.id === id) ?? null;
  });

  // ¿El área tiene subáreas?
  readonly hasSubareas = computed(() => (this.selectedArea()?.children?.length ?? 0) > 0);

  // Opciones para el select de área (solo áreas raíz)
  readonly areaOptions = computed<SelectOption[]>(() => [
    { value: '', label: '— Seleccionar área —' },
    ...this.depts().map(d => ({ value: d.id, label: d.name })),
  ]);

  // Opciones para el select de subárea (solo si el área tiene subareas)
  readonly subareaOptions = computed<SelectOption[]>(() => {
    const area = this.selectedArea();
    if (!area?.children?.length) return [];
    return [
      { value: '', label: '— Directo en el área —' },
      ...area.children.map(c => ({ value: c.id, label: c.name })),
    ];
  });

  // Opciones de puesto: dependen del área y/o subárea seleccionada
  readonly positionOptions = computed<SelectOption[]>(() => {
    const area = this.selectedArea();
    if (!area) return [{ value: '', label: '— Primero selecciona un área —' }];

    const subareaId = this.selectedSubareaId();
    let positions = area.positions;

    if (subareaId) {
      const sub = area.children.find(c => c.id === subareaId);
      positions = sub?.positions ?? [];
    }

    if (!positions.length) return [{ value: '', label: '— Sin puestos disponibles —' }];
    return [
      { value: '', label: '— Seleccionar puesto —' },
      ...positions.map(p => ({ value: p.id, label: p.name })),
    ];
  });

  // ── Aprobadores ───────────────────────────────────────────────────────────
  readonly selectedApprovers  = signal<EmployeeMinimal[]>([]);
  readonly approverSearchCtrl = new FormControl('');

  private readonly approverQuery = toSignal(
    this.approverSearchCtrl.valueChanges.pipe(startWith(''), debounceTime(150)),
    { initialValue: '' },
  );

  readonly filteredEmployees = computed<EmployeeMinimal[]>(() => {
    const q   = (this.approverQuery() ?? '').toLowerCase().trim();
    const ids = new Set(this.selectedApprovers().map(a => a.id));
    return this.allEmployees()
      .filter(e => !ids.has(e.id))
      .filter(e => !q ||
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        (e.position?.name?.toLowerCase().includes(q) ?? false),
      )
      .slice(0, 25);
  });

  ngOnInit(): void {
    this.searchCtrl.valueChanges.pipe(
      debounceTime(350), distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => { this.page.set(1); this.load(); });

    // Al cambiar área: reset subárea y puesto
    this.areaIdCtrl.valueChanges.pipe(
      distinctUntilChanged(), takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.subareaIdCtrl.setValue('', { emitEvent: false });
      this.createForm.patchValue({ positionId: '' });
    });

    // Al cambiar subárea: reset puesto
    this.subareaIdCtrl.valueChanges.pipe(
      distinctUntilChanged(), takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.createForm.patchValue({ positionId: '' }));

    // Cargar datos maestros
    this.candidatesSvc.listDepartments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.depts.set(d));

    this.candidatesSvc.listActiveEmployees()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => this.allEmployees.set(e));

    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.svc.list({ page: this.page(), limit: PAGE_SIZE, search: this.searchCtrl.value ?? '' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.processes.set(result.data);
          this.total.set(result.total);
          this.isLoading.set(false);
        },
        error: err => {
          this.isLoading.set(false);
          this.loadError.set(err?.error?.message ?? 'Error al cargar los procesos.');
        },
      });
  }

  // ── Modal actions ─────────────────────────────────────────────────────────
  openCreateModal(): void {
    this.createForm.reset({ description: '', areaId: '', subareaId: '', positionId: '' });
    this.selectedApprovers.set([]);
    this.approverSearchCtrl.reset('');
    this.createError.set('');
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void { this.isCreateModalOpen.set(false); }

  toggleApprover(emp: EmployeeMinimal): void {
    this.selectedApprovers.update(curr => {
      if (curr.length >= 5) return curr;
      return [...curr, emp];
    });
    this.approverSearchCtrl.reset('');
  }

  removeApprover(id: string): void {
    this.selectedApprovers.update(curr => curr.filter(a => a.id !== id));
  }

  createProcess(): void {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    if (this.selectedApprovers().length === 0) {
      this.createError.set('Debe agregar al menos 1 aprobador al proceso.');
      return;
    }

    this.isCreating.set(true);
    this.createError.set('');

    const raw = this.createForm.value;
    // El departmentId efectivo es la subárea si está seleccionada, sino el área
    const effectiveDeptId = raw.subareaId || raw.areaId;

    const payload: any = {
      departmentId: effectiveDeptId,
      positionId:   raw.positionId,
      approverIds:  this.selectedApprovers().map(a => a.id),
    };
    if (raw.description) payload['description'] = raw.description;

    this.svc.create(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: process => {
        this.isCreating.set(false);
        this.closeCreateModal();
        this.router.navigate(['/admin/procesos-seleccion', process.code]);
      },
      error: err => {
        this.isCreating.set(false);
        const firstErr = err?.error?.errors?.[0];
        this.createError.set((err?.error?.message ?? 'Error al crear el proceso.') +
          (firstErr ? ` — ${firstErr.message}` : ''));
      },
    });
  }

  /** Muestra "Área" o "Área / Subárea" según si el proceso está en una subárea */
  deptLabel(p: SelectionProcess): string {
    if (!p.department) return '—';
    if (p.department.parent) return `${p.department.parent.name} / ${p.department.name}`;
    return p.department.name;
  }

  openProcess(process: SelectionProcess): void {
    this.router.navigate(['/admin/procesos-seleccion', process.code]);
  }

  onPageChange(p: number): void { this.page.set(p); this.load(); }
}

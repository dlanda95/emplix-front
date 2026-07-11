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

  private readonly deptIdCtrl = new FormControl('', Validators.required);

  readonly createForm = this.fb.group({
    name:         ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    description:  ['', Validators.maxLength(500)],
    departmentId: this.deptIdCtrl,
    positionId:   [''],
  });

  // Cuando cambia el área, limpiamos el puesto
  private readonly selectedDeptId = toSignal(
    this.deptIdCtrl.valueChanges.pipe(startWith('')),
    { initialValue: '' },
  );

  readonly deptOptions = computed<SelectOption[]>(() => [
    { value: '', label: '— Seleccionar área —' },
    ...this.depts().map(d => ({ value: d.id, label: d.name })),
  ]);

  readonly positionOptions = computed<SelectOption[]>(() => {
    const deptId = this.selectedDeptId();
    if (!deptId) return [{ value: '', label: '— Primero selecciona un área —' }];
    const dept = this.depts().find(d => d.id === deptId);
    if (!dept?.positions?.length) return [{ value: '', label: '— Sin puestos en esta área —' }];
    return [
      { value: '', label: '— Sin puesto específico —' },
      ...dept.positions.map(p => ({ value: p.id, label: p.name })),
    ];
  });

  // ── Aprobadores ───────────────────────────────────────────────────────────
  readonly selectedApprovers = signal<EmployeeMinimal[]>([]);
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

    // Limpiar puesto al cambiar área
    this.deptIdCtrl.valueChanges.pipe(
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
    this.createForm.reset({ name: '', description: '', departmentId: '', positionId: '' });
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
    const payload: any = {
      name:         raw.name,
      departmentId: raw.departmentId,
      approverIds:  this.selectedApprovers().map(a => a.id),
    };
    if (raw.description) payload['description'] = raw.description;
    if (raw.positionId)  payload['positionId']  = raw.positionId;

    this.svc.create(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: process => {
        this.isCreating.set(false);
        this.closeCreateModal();
        this.router.navigate(['/admin/procesos-seleccion', process.id]);
      },
      error: err => {
        this.isCreating.set(false);
        const firstErr = err?.error?.errors?.[0];
        this.createError.set((err?.error?.message ?? 'Error al crear el proceso.') +
          (firstErr ? ` — ${firstErr.message}` : ''));
      },
    });
  }

  openProcess(processId: string): void {
    this.router.navigate(['/admin/procesos-seleccion', processId]);
  }

  onPageChange(p: number): void { this.page.set(p); this.load(); }
}

import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Badge, Banner, Button, EmptyState, FilterChips, LoadingSkeleton,
  Modal, PageHeader, SectionCard, AppInput, AppSelect, TabsCard,
} from '@shared/ui';
import type { FilterChipItem, SelectOption, TabItem } from '@shared/ui';
import {
  OrganizationAdminService,
  Area, Subarea, Position,
  AreaPayload, PositionPayload,
  AREA_TYPE_LABELS, AREA_TYPE_VARIANTS, ROLE_TYPE_LABELS,
  AreaType, RoleType,
} from '../services/organization.service';

const AREA_TABS: TabItem[] = [
  { id: 'areas',     label: 'Áreas',   icon: 'account_tree' },
  { id: 'positions', label: 'Cargos',  icon: 'badge'        },
];

const TYPE_CHIPS: FilterChipItem[] = [
  { id: 'ALL',         label: 'Todas'       },
  { id: 'TRANSVERSAL', label: 'Transversal' },
  { id: 'EMISSIVE',    label: 'Emisiva'     },
  { id: 'RECEPTIVE',   label: 'Receptiva'   },
];

const AREA_TYPE_OPTIONS: SelectOption[] = [
  { value: 'TRANSVERSAL', label: 'Transversal — da servicio a toda la empresa' },
  { value: 'EMISSIVE',    label: 'Emisiva — genera valor hacia afuera'         },
  { value: 'RECEPTIVE',   label: 'Receptiva — recibe información o soporte'    },
];

const ROLE_TYPE_OPTIONS: SelectOption[] = [
  { value: 'OPERATIONAL', label: 'Operativo'  },
  { value: 'TACTICAL',    label: 'Táctico'    },
  { value: 'STRATEGIC',   label: 'Estratégico'},
];

const LEVEL_OPTIONS: SelectOption[] = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `Nivel ${i + 1}`,
}));

@Component({
  selector: 'app-organizacion',
  imports: [
    CommonModule, ReactiveFormsModule,
    Badge, Banner, Button, EmptyState, FilterChips, LoadingSkeleton,
    Modal, PageHeader, SectionCard, AppInput, AppSelect, TabsCard,
  ],
  templateUrl: './organizacion.html',
  styleUrl:    './organizacion.scss',
})
export class Organizacion {
  private readonly svc = inject(OrganizationAdminService);
  private readonly fb  = inject(FormBuilder);

  // ── Estado ────────────────────────────────────────────────────────────────
  readonly activeTab     = signal<string>('areas');
  readonly typeFilter    = signal<string>('ALL');
  readonly expandedArea  = signal<string | null>(null);
  readonly isLoading     = signal(true);
  readonly isSaving      = signal(false);
  readonly errorMsg      = signal('');

  // ── Datos ─────────────────────────────────────────────────────────────────
  readonly areas     = signal<Area[]>([]);
  readonly positions = signal<Position[]>([]);

  // ── Modales ───────────────────────────────────────────────────────────────
  readonly areaModal    = signal(false);
  readonly subareaModal = signal(false);
  readonly posModal     = signal(false);

  editingId    = signal<string | null>(null);
  subareaParentId = signal<string | null>(null);

  // ── Formularios ───────────────────────────────────────────────────────────
  areaForm = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(2)]],
    code:        [''],
    description: [''],
    areaType:    ['TRANSVERSAL'],
    isActive:    [true],
  });

  subareaForm = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    areaType:    ['TRANSVERSAL'],
    isActive:    [true],
  });

  posForm = this.fb.group({
    name:           ['', [Validators.required, Validators.minLength(2)]],
    description:    [''],
    hierarchyLevel: ['1'],
    roleType:       ['OPERATIONAL'],
    departmentId:   [''],
    isActive:       [true],
  });

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly filteredAreas = computed(() => {
    const f = this.typeFilter();
    const all = this.areas();
    return f === 'ALL' ? all : all.filter(a => a.areaType === f);
  });

  readonly areaOptions = computed<SelectOption[]>(() =>
    this.areas().flatMap(a => [
      { value: a.id, label: a.name },
      ...a.children.map(s => ({ value: s.id, label: `↳ ${a.name} / ${s.name}` })),
    ])
  );

  // Angular templates no soportan spread; esta computed incluye la opción vacía
  readonly areaSelectOptions = computed<SelectOption[]>(() => [
    { value: '', label: '— Sin área —' },
    ...this.areaOptions(),
  ]);

  // ── Constantes para template ──────────────────────────────────────────────
  readonly tabs          = AREA_TABS;
  readonly typeChips     = TYPE_CHIPS;
  readonly areaTypeOpts  = AREA_TYPE_OPTIONS;
  readonly roleTypeOpts  = ROLE_TYPE_OPTIONS;
  readonly levelOpts     = LEVEL_OPTIONS;
  readonly areaTypeLabels  = AREA_TYPE_LABELS;
  readonly areaTypeVariants = AREA_TYPE_VARIANTS;
  readonly roleTypeLabels  = ROLE_TYPE_LABELS;

  constructor() { this.loadAreas(); }

  // ── Carga ─────────────────────────────────────────────────────────────────
  private loadAreas(): void {
    this.isLoading.set(true);
    this.svc.getAreas(true).subscribe({
      next: list => { this.areas.set(list); this.isLoading.set(false); },
      error: ()  => this.isLoading.set(false),
    });
  }

  private loadPositions(): void {
    this.isLoading.set(true);
    this.svc.getPositions(true).subscribe({
      next: list => { this.positions.set(list); this.isLoading.set(false); },
      error: ()  => this.isLoading.set(false),
    });
  }

  onTabChange(tab: string): void {
    this.activeTab.set(tab);
    this.errorMsg.set('');
    if (tab === 'positions' && this.positions().length === 0) this.loadPositions();
  }

  // ── Acordeón de áreas ─────────────────────────────────────────────────────
  toggleExpand(id: string): void {
    this.expandedArea.set(this.expandedArea() === id ? null : id);
  }

  // ── Modal Área ────────────────────────────────────────────────────────────
  openNewArea(): void {
    this.editingId.set(null);
    this.areaForm.reset({ name: '', code: '', description: '', areaType: 'TRANSVERSAL', isActive: true });
    this.errorMsg.set('');
    this.areaModal.set(true);
  }

  openEditArea(area: Area | Subarea): void {
    this.editingId.set(area.id);
    this.areaForm.patchValue({
      name: area.name, description: area.description ?? '', areaType: area.areaType,
      isActive: area.isActive, code: (area as Area).code ?? '',
    });
    this.errorMsg.set('');
    this.areaModal.set(true);
  }

  saveArea(): void {
    if (this.areaForm.invalid) return;
    const v = this.areaForm.value;
    const payload: AreaPayload = {
      name:        v.name!,
      description: v.description || undefined,
      code:        v.code || null,
      areaType:    v.areaType as AreaType,
      isActive:    v.isActive!,
    };
    this.isSaving.set(true);
    const id = this.editingId();
    const obs$ = id ? this.svc.updateArea(id, payload) : this.svc.createArea(payload);
    obs$.subscribe({
      next: () => { this.areaModal.set(false); this.isSaving.set(false); this.loadAreas(); },
      error: (err) => { this.errorMsg.set(err?.error?.message ?? 'Error al guardar'); this.isSaving.set(false); },
    });
  }

  deleteArea(area: Area | Subarea): void {
    if (!confirm(`¿Eliminar "${area.name}"? Esta acción no se puede deshacer.`)) return;
    const obs$ = (area as Area).parentId === null
      ? this.svc.deleteArea(area.id)
      : this.svc.deleteSubarea(area.id);
    obs$.subscribe({
      next: () => this.loadAreas(),
      error: (err) => alert(err?.error?.message ?? 'Error al eliminar'),
    });
  }

  // ── Modal Subárea ─────────────────────────────────────────────────────────
  openNewSubarea(area: Area): void {
    this.subareaParentId.set(area.id);
    this.editingId.set(null);
    this.subareaForm.reset({ name: '', description: '', areaType: area.areaType, isActive: true });
    this.errorMsg.set('');
    this.subareaModal.set(true);
  }

  saveSubarea(): void {
    if (this.subareaForm.invalid) return;
    const v = this.subareaForm.value;
    const payload: AreaPayload = {
      name:        v.name!,
      description: v.description || undefined,
      areaType:    v.areaType as AreaType,
      isActive:    v.isActive!,
    };
    const parentId = this.subareaParentId();
    const editId   = this.editingId();
    this.isSaving.set(true);
    const obs$ = editId
      ? this.svc.updateSubarea(editId, payload)
      : this.svc.createSubarea(parentId!, payload);
    obs$.subscribe({
      next: () => { this.subareaModal.set(false); this.isSaving.set(false); this.loadAreas(); },
      error: (err) => { this.errorMsg.set(err?.error?.message ?? 'Error al guardar'); this.isSaving.set(false); },
    });
  }

  openEditSubarea(sub: Subarea): void {
    this.subareaParentId.set(sub.parentId);
    this.editingId.set(sub.id);
    this.subareaForm.patchValue({
      name: sub.name, description: sub.description ?? '', areaType: sub.areaType, isActive: sub.isActive,
    });
    this.errorMsg.set('');
    this.subareaModal.set(true);
  }

  // ── Modal Cargo ───────────────────────────────────────────────────────────
  openNewPosition(): void {
    this.editingId.set(null);
    this.posForm.reset({ name: '', description: '', hierarchyLevel: '1', roleType: 'OPERATIONAL', departmentId: '', isActive: true });
    this.errorMsg.set('');
    this.posModal.set(true);
  }

  openEditPosition(pos: Position): void {
    this.editingId.set(pos.id);
    this.posForm.patchValue({
      name:           pos.name,
      description:    pos.description ?? '',
      hierarchyLevel: String(pos.hierarchyLevel),
      roleType:       pos.roleType,
      departmentId:   pos.departmentId ?? '',
      isActive:       pos.isActive,
    });
    this.errorMsg.set('');
    this.posModal.set(true);
  }

  savePosition(): void {
    if (this.posForm.invalid) return;
    const v = this.posForm.value;
    const payload: PositionPayload = {
      name:           v.name!,
      description:    v.description || undefined,
      hierarchyLevel: Number(v.hierarchyLevel),
      roleType:       v.roleType as RoleType,
      departmentId:   v.departmentId || null,
      isActive:       v.isActive!,
    };
    this.isSaving.set(true);
    const id = this.editingId();
    const obs$ = id ? this.svc.updatePosition(id, payload) : this.svc.createPosition(payload);
    obs$.subscribe({
      next: () => { this.posModal.set(false); this.isSaving.set(false); this.loadPositions(); },
      error: (err) => { this.errorMsg.set(err?.error?.message ?? 'Error al guardar'); this.isSaving.set(false); },
    });
  }

  deletePosition(pos: Position): void {
    if (!confirm(`¿Eliminar cargo "${pos.name}"?`)) return;
    this.svc.deletePosition(pos.id).subscribe({
      next: () => this.loadPositions(),
      error: (err) => alert(err?.error?.message ?? 'Error al eliminar'),
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  areaTypeLabel(t: string):   string { return AREA_TYPE_LABELS[t as AreaType]  ?? t; }
  areaTypeVariant(t: string): 'primary' | 'success' | 'warning' | 'error' | 'neutral' {
    return AREA_TYPE_VARIANTS[t as AreaType] ?? 'neutral';
  }
  roleTypeLabel(t: string):   string { return ROLE_TYPE_LABELS[t as RoleType]  ?? t; }
}

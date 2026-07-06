import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import {
  Avatar, Badge, Banner, Button, EmptyState, FilterChips, LoadingSkeleton,
  Modal, PageHeader, Pagination, SectionCard, AppInput,
} from '@shared/ui';
import type { FilterChipItem } from '@shared/ui';
import { RequestsAdminService, ChangeRequest, RequestStatus } from '../services/requests-admin.service';
import { PermissionsService } from '@core/auth/permissions.service';
import {
  GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, ACADEMIC_LEVEL_OPTIONS,
  DOCUMENT_TYPE_OPTIONS, AFP_TYPE_OPTIONS, AFP_ENTITY_OPTIONS, AFP_COMMISSION_OPTIONS,
  catalogLabel,
} from '@features/portal/models/catalog.model';

// Campos por sección (para detectar de qué sección es cada solicitud)
const ADDRESS_FIELDS  = new Set(['address', 'district', 'province', 'departmentdirec', 'addressRef']);
const FINANCIAL_FIELDS = new Set(['bankAccount', 'bankEntity', 'bankCci', 'afpType', 'afpEntity', 'afpCommission']);

// Etiquetas legibles para TODOS los campos editables del perfil
const FIELD_LABELS: Record<string, string> = {
  // Información personal
  firstName:      'Primer Nombre',
  middleName:     'Segundo Nombre',
  lastName:       'Apellido Paterno',
  secondLastName: 'Apellido Materno',
  birthDate:      'Fecha de Nacimiento',
  gender:         'Género',
  maritalStatus:  'Estado Civil',
  nationality:    'Nacionalidad',
  academicLevel:  'Grado Académico',
  // Lugar de nacimiento
  birthCountry:   'País de Nacimiento',
  birthRegion:    'Departamento de Nacimiento',
  birthDistrict:  'Distrito de Nacimiento',
  // Documentos
  documentType:   'Tipo de Documento',
  documentId:     'N° Documento',
  licenseNumber:  'Brevete',
  docAddress:     'Dirección (Doc. Identidad)',
  docDistrict:    'Distrito (Doc. Identidad)',
  docDepartment:  'Departamento (Doc. Id.)',
  docAddressRef:  'Referencia (Doc. Id.)',
  // Domicilio actual
  address:         'Dirección',
  district:        'Distrito',
  province:        'Provincia',
  departmentdirec: 'Departamento',
  addressRef:      'Referencia',
  // Financiero
  afpType:       'Sistema AFP',
  afpEntity:     'Entidad AFP',
  afpCommission: 'Tipo de Comisión',
  bankEntity:    'Entidad Bancaria',
  bankAccount:   'N° Cuenta',
  bankCci:       'CCI',
};

// Mapeo campo → opciones de catálogo para mostrar la etiqueta legible
const FIELD_OPTIONS: Record<string, Array<{ value: string; label: string }>> = {
  gender:         GENDER_OPTIONS,
  maritalStatus:  MARITAL_STATUS_OPTIONS,
  academicLevel:  ACADEMIC_LEVEL_OPTIONS,
  documentType:   DOCUMENT_TYPE_OPTIONS,
  afpType:        AFP_TYPE_OPTIONS,
  afpEntity:      AFP_ENTITY_OPTIONS,
  afpCommission:  AFP_COMMISSION_OPTIONS,
};

/** Normaliza un valor para comparación: null / undefined / '' → null */
function norm(val: unknown): string | null {
  if (val === null || val === undefined || val === '') return null;
  return String(val);
}

/** Etiqueta de visualización para un valor raw (null → guión, enum → label legible) */
function display(val: unknown, field?: string): string {
  const raw = norm(val);
  if (raw === null) return '—';
  if (field && FIELD_OPTIONS[field]) return catalogLabel(FIELD_OPTIONS[field], raw);
  // Fechas ISO → formato local
  if (field === 'birthDate' && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return new Date(raw).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  return raw;
}

function detectSection(data: Record<string, unknown> | null | undefined): { label: string; icon: string } {
  if (!data) return { label: 'Datos', icon: 'edit_note' };
  const keys = new Set(Object.keys(data).filter(k => k !== '_previous'));
  if ([...keys].some(k => ADDRESS_FIELDS.has(k)))   return { label: 'Domicilio',       icon: 'home'            };
  if ([...keys].some(k => FINANCIAL_FIELDS.has(k))) return { label: 'Financiero',      icon: 'account_balance' };
  return                                                     { label: 'Datos Personales', icon: 'badge'           };
}

function buildDiff(data: Record<string, unknown> | null | undefined): Array<{ field: string; label: string; old: string; new: string }> {
  if (!data) return [];
  const previous = (data['_previous'] as Record<string, unknown>) ?? {};

  return Object.keys(data)
    .filter(k => k !== '_previous' && FIELD_LABELS[k])           // solo campos conocidos
    .filter(k => norm(previous[k]) !== norm(data[k]))            // solo los que realmente cambiaron
    .map(k => ({
      field: k,
      label: FIELD_LABELS[k],
      old:   display(previous[k], k),
      new:   display(data[k], k),
    }));
}

const STATUS_FILTER_CHIPS: FilterChipItem[] = [
  { id: 'ALL',      label: 'Todas'     },
  { id: 'PENDING',  label: 'Pendientes' },
  { id: 'APPROVED', label: 'Aprobadas'  },
  { id: 'REJECTED', label: 'Rechazadas' },
];

const PAGE_SIZE = 25;

@Component({
  selector: 'app-requests-admin',
  imports: [
    CommonModule, ReactiveFormsModule,
    Avatar, Badge, Banner, Button, EmptyState, FilterChips,
    LoadingSkeleton, Modal, PageHeader, Pagination, SectionCard, AppInput,
  ],
  templateUrl: './requests-admin.html',
})
export class RequestsAdmin implements OnInit {
  private readonly svc        = inject(RequestsAdminService);
  private readonly destroyRef = inject(DestroyRef);
  readonly perms              = inject(PermissionsService);

  readonly statusFilter  = signal<string>('ALL');
  readonly isLoading     = signal(true);
  readonly requests      = signal<ChangeRequest[]>([]);
  readonly total         = signal(0);
  readonly totalPages    = signal(1);
  readonly page          = signal(1);
  readonly pageSize      = PAGE_SIZE;
  readonly statusChips   = STATUS_FILTER_CHIPS;

  readonly loadError     = signal('');
  readonly rejectModal   = signal(false);
  readonly rejectTarget  = signal<string | null>(null);
  readonly rejectReason  = new FormControl('');
  readonly isProcessing  = signal(false);
  readonly searchCtrl    = new FormControl('');

  readonly pendingCount  = signal(0);

  ngOnInit(): void {
    this.searchCtrl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => { this.page.set(1); this.loadAll(); });

    this.loadAll();
  }

  private loadAll(): void {
    this.isLoading.set(true);
    const status = this.statusFilter() === 'ALL' ? undefined : this.statusFilter();
    this.svc.getAll({
      page:   this.page(),
      limit:  PAGE_SIZE,
      status,
      search: this.searchCtrl.value ?? '',
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        this.requests.set(result.data);
        this.total.set(result.total);
        this.totalPages.set(result.totalPages);
        this.isLoading.set(false);
        if (!status) this.pendingCount.set(result.data.filter(r => r.status === 'PENDING').length);
      },
      error: err => { this.isLoading.set(false); this.loadError.set(err?.error?.message ?? 'Error al cargar las solicitudes.'); },
    });
  }

  onFilterChange(id: string): void { this.statusFilter.set(id); this.page.set(1); this.loadAll(); }
  onPageChange(p: number): void    { this.page.set(p); this.loadAll(); }

  approve(id: string): void {
    this.isProcessing.set(true);
    this.svc.approve(id).subscribe({
      next: () => {
        this.updateStatus(id, 'APPROVED');
        this.isProcessing.set(false);
      },
      error: () => this.isProcessing.set(false),
    });
  }

  openRejectModal(id: string): void {
    this.rejectTarget.set(id);
    this.rejectReason.reset();
    this.rejectModal.set(true);
  }

  confirmReject(): void {
    const id     = this.rejectTarget();
    const reason = this.rejectReason.value?.trim();
    if (!id || !reason) return;
    this.isProcessing.set(true);
    this.svc.reject(id, reason).subscribe({
      next: () => {
        this.updateStatus(id, 'REJECTED');
        this.rejectModal.set(false);
        this.isProcessing.set(false);
      },
      error: () => this.isProcessing.set(false),
    });
  }

  private updateStatus(id: string, status: RequestStatus): void {
    this.requests.update(list =>
      list.map(r => r.id === id ? { ...r, status } : r)
    );
  }

  // Template helpers
  detectSection = detectSection;
  buildDiff     = buildDiff;

  employeeName(r: ChangeRequest): string {
    const e = r.user?.employee;
    return e ? `${e.firstName} ${e.lastName}` : r.user?.email ?? '—';
  }
}

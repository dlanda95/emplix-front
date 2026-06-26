import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Avatar, Badge, Banner, Button, EmptyState, FilterChips, LoadingSkeleton,
  Modal, PageHeader, SectionCard, AppInput,
} from '@shared/ui';
import type { FilterChipItem } from '@shared/ui';
import { RequestsAdminService, ChangeRequest, RequestStatus } from '../services/requests-admin.service';

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

/** Normaliza un valor para comparación: null / undefined / '' → null */
function norm(val: unknown): string | null {
  if (val === null || val === undefined || val === '') return null;
  return String(val);
}

/** Etiqueta de visualización para un valor (null → guión) */
function display(val: unknown): string {
  const n = norm(val);
  return n ?? '—';
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
      old:   display(previous[k]),
      new:   display(data[k]),
    }));
}

const STATUS_FILTER_CHIPS: FilterChipItem[] = [
  { id: 'ALL',      label: 'Todas'     },
  { id: 'PENDING',  label: 'Pendientes' },
  { id: 'APPROVED', label: 'Aprobadas'  },
  { id: 'REJECTED', label: 'Rechazadas' },
];

@Component({
  selector: 'app-requests-admin',
  imports: [
    CommonModule, ReactiveFormsModule,
    Avatar, Badge, Banner, Button, EmptyState, FilterChips,
    LoadingSkeleton, Modal, PageHeader, SectionCard, AppInput,
  ],
  templateUrl: './requests-admin.html',
})
export class RequestsAdmin {
  private readonly svc = inject(RequestsAdminService);

  readonly statusFilter  = signal<string>('ALL');
  readonly isLoading     = signal(true);
  readonly requests      = signal<ChangeRequest[]>([]);
  readonly statusChips   = STATUS_FILTER_CHIPS;

  readonly rejectModal   = signal(false);
  readonly rejectTarget  = signal<string | null>(null);
  readonly rejectReason  = new FormControl('');
  readonly isProcessing  = signal(false);

  readonly filtered = computed(() => {
    const s = this.statusFilter();
    const all = this.requests();
    return s === 'ALL' ? all : all.filter(r => r.status === s);
  });

  readonly pendingCount = computed(() => this.requests().filter(r => r.status === 'PENDING').length);

  constructor() { this.loadAll(); }

  private loadAll(): void {
    this.isLoading.set(true);
    this.svc.getAll().subscribe({
      next: list => { this.requests.set(list); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  onFilterChange(id: string): void { this.statusFilter.set(id); }

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

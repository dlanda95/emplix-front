import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  PageHeader, Button, Banner, Badge, EmptyState, LoadingSkeleton, SectionCard,
  AdminPageLayout, DataTable,
} from '@shared/ui';
import { UsersAdminService, SystemUserType, PermissionSet } from '../../users/users-admin.service';
import { PermissionsService } from '@core/auth/permissions.service';

const PERM_LABELS: Array<{ key: keyof PermissionSet; label: string; icon: string }> = [
  { key: 'canRead',          label: 'Leer',          icon: 'visibility'      },
  { key: 'canCreate',        label: 'Crear',          icon: 'add_circle'      },
  { key: 'canEdit',          label: 'Editar',         icon: 'edit'            },
  { key: 'canDelete',        label: 'Eliminar',       icon: 'delete'          },
  { key: 'canApprove',       label: 'Aprobar',        icon: 'task_alt'        },
  { key: 'canManageConfig',  label: 'Configuración',  icon: 'settings'        },
  { key: 'canManageUsers',   label: 'Usuarios',       icon: 'manage_accounts' },
];

@Component({
  selector: 'app-user-types-page',
  imports: [CommonModule, ReactiveFormsModule, PageHeader, Button, Banner, Badge, EmptyState, LoadingSkeleton, SectionCard, AdminPageLayout, DataTable],
  templateUrl: './user-types-page.html',
})
export class UserTypesPage implements OnInit {
  private readonly svc        = inject(UsersAdminService);
  private readonly fb         = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  readonly perms              = inject(PermissionsService);

  readonly permLabels = PERM_LABELS;

  readonly types      = signal<SystemUserType[]>([]);
  readonly isLoading  = signal(true);
  readonly loadError  = signal('');
  readonly saving     = signal(false);
  readonly errorMsg   = signal('');
  readonly editingId    = signal<string | null>(null);
  readonly visibleTypes = computed(() => {
    const id = this.editingId();
    return id ? this.types().filter(t => t.id !== id) : this.types();
  });

  readonly COLOR_PALETTE = [
    '#7c3aed', '#0ea5e9', '#f59e0b', '#10b981',
    '#ef4444', '#f97316', '#8b5cf6', '#06b6d4',
  ];

  form = this.fb.group({
    name:        ['', Validators.required],
    slug:        ['', [Validators.required, Validators.pattern(/^[a-z0-9_-]+$/)]],
    description: [''],
    color:       ['#6B7280'],
    canRead:         [false],
    canCreate:       [false],
    canEdit:         [false],
    canDelete:       [false],
    canApprove:      [false],
    canManageConfig: [false],
    canManageUsers:  [false],
  });

  readonly showForm = signal(false);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading.set(true);
    this.svc.listSystemUserTypes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:  t => { this.types.set(t); this.isLoading.set(false); },
      error: e => { this.loadError.set(e?.error?.message ?? 'Error al cargar'); this.isLoading.set(false); },
    });
  }

  startNew(): void {
    this.editingId.set(null);
    this.form.reset({ color: '#7c3aed' });
    this.showForm.set(true);
  }

  startEdit(t: SystemUserType): void {
    this.editingId.set(t.id);
    const p = t.permissions as PermissionSet;
    this.form.reset({
      name: t.name, slug: t.slug, description: t.description ?? '', color: t.color,
      canRead: p.canRead, canCreate: p.canCreate, canEdit: p.canEdit,
      canDelete: p.canDelete, canApprove: p.canApprove,
      canManageConfig: p.canManageConfig, canManageUsers: p.canManageUsers,
    });
    if (t.isSystem) this.form.get('slug')!.disable();
    else            this.form.get('slug')!.enable();
    this.showForm.set(true);
  }

  cancelForm(): void { this.showForm.set(false); this.editingId.set(null); this.errorMsg.set(''); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.errorMsg.set('');

    const v = this.form.getRawValue();
    const permissions: PermissionSet = {
      canRead: !!v.canRead, canCreate: !!v.canCreate, canEdit: !!v.canEdit,
      canDelete: !!v.canDelete, canApprove: !!v.canApprove,
      canManageConfig: !!v.canManageConfig, canManageUsers: !!v.canManageUsers,
    };
    const payload = { name: v.name!, slug: v.slug!, description: v.description || undefined, color: v.color!, permissions };

    const id = this.editingId();
    const op$ = id
      ? this.svc.updateSystemUserType(id, payload)
      : this.svc.createSystemUserType(payload);

    op$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.load(); },
      error: e => { this.saving.set(false); this.errorMsg.set(e?.error?.message ?? 'Error al guardar'); },
    });
  }

  toggleActive(t: SystemUserType): void {
    this.svc.updateSystemUserType(t.id, { isActive: !t.isActive })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.load() });
  }

  delete(t: SystemUserType): void {
    if (!confirm(`¿Eliminar el tipo "${t.name}"? Esta acción no se puede deshacer.`)) return;
    this.svc.deleteSystemUserType(t.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: () => this.load() });
  }

  setColor(c: string): void { this.form.patchValue({ color: c }); }

  permOf(t: SystemUserType, key: keyof PermissionSet): boolean {
    return !!(t.permissions as PermissionSet)?.[key];
  }
}

import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Avatar, Badge, Banner, Button, EmptyState, FilterChips,
  LoadingSkeleton, PageHeader, SectionCard, StatCard, AppInput, ConfirmModal,
} from '@shared/ui';
import type { FilterChipItem } from '@shared/ui';
import { UsersAdminService, UserListItem, UserRole } from './users-admin.service';
import { CreateUserDrawer } from './create-user-drawer/create-user-drawer';
import { EditUserDrawer } from './edit-user-drawer/edit-user-drawer';
import { PermissionsService } from '@core/auth/permissions.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-users-page',
  imports: [
    CommonModule, ReactiveFormsModule,
    Avatar, Badge, Banner, Button, EmptyState, FilterChips, ConfirmModal,
    LoadingSkeleton, PageHeader, SectionCard, StatCard, AppInput,
    CreateUserDrawer, EditUserDrawer,
  ],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss',
})
export class UsersPage implements OnInit {
  private readonly svc        = inject(UsersAdminService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast      = inject(ToastService);
  readonly perms              = inject(PermissionsService);

  readonly users        = signal<UserListItem[]>([]);
  readonly isLoading    = signal(true);
  readonly loadError    = signal('');
  readonly search       = signal('');
  readonly activeFilter = signal<'all' | 'active' | 'inactive'>('all');
  readonly searchCtrl   = new FormControl('');

  showUserDrawer     = signal(false);
  showEditDrawer     = signal(false);
  editTarget         = signal<UserListItem | null>(null);
  confirmToggleUser  = signal<UserListItem | null>(null);

  readonly filterChips = computed((): FilterChipItem[] => [
    { id: 'all',      label: 'Todos',     icon: 'people', count: this.users().length },
    { id: 'active',   label: 'Activos',   icon: 'check_circle', count: this.users().filter(u => u.isActive).length },
    { id: 'inactive', label: 'Inactivos', icon: 'block',        count: this.users().filter(u => !u.isActive).length },
  ]);

  readonly filtered = computed(() => {
    let list = this.users();
    const q = this.search().toLowerCase().trim();
    const f = this.activeFilter();

    if (f === 'active')   list = list.filter(u => u.isActive);
    if (f === 'inactive') list = list.filter(u => !u.isActive);

    if (q) {
      list = list.filter(u =>
        u.email.toLowerCase().includes(q) ||
        `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase().includes(q) ||
        (u.systemUserType?.name?.toLowerCase().includes(q) ?? false),
      );
    }
    return list;
  });

  readonly totalActive = computed(() => this.users().filter(u => u.isActive).length);
  readonly totalTypes  = computed(() => new Set(this.users().map(u => u.systemUserType?.id).filter(Boolean)).size);

  ngOnInit(): void {
    this.searchCtrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(q => this.search.set(q ?? ''));
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.svc.listSystemUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:  list => { this.users.set(list); this.isLoading.set(false); },
      error: err  => { this.isLoading.set(false); this.loadError.set(err?.error?.message ?? 'Error al cargar los usuarios.'); },
    });
  }

  requestToggle(user: UserListItem): void {
    this.confirmToggleUser.set(user);
  }

  confirmToggle(): void {
    const user = this.confirmToggleUser();
    if (!user) return;
    this.confirmToggleUser.set(null);
    this.svc.toggleStatus(user.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: updated => {
        this.users.update(list => list.map(u => u.id === updated.id ? { ...u, ...updated } : u));
        this.toast.info(updated.isActive ? 'Usuario activado.' : 'Usuario desactivado.');
      },
      error: () => this.toast.error('Error al cambiar el estado del usuario.'),
    });
  }

  onUserCreated(): void {
    this.showUserDrawer.set(false);
    this.loadUsers();
    this.toast.success('Usuario creado correctamente.');
  }

  openEdit(u: UserListItem): void {
    this.editTarget.set(u);
    this.showEditDrawer.set(true);
  }

  onUserUpdated(): void {
    this.showEditDrawer.set(false);
    this.loadUsers();
    this.toast.success('Tipo de acceso actualizado correctamente.');
  }

  displayName(u: UserListItem): string {
    if (u.firstName) return `${u.firstName} ${u.lastName ?? ''}`.trim();
    return u.email.split('@')[0];
  }
}

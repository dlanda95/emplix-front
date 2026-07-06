import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Avatar, Badge, Banner, Button, EmptyState, FilterChips,
  LoadingSkeleton, PageHeader, SectionCard, StatCard, AppInput,
} from '@shared/ui';
import type { FilterChipItem } from '@shared/ui';
import { UsersAdminService, UserListItem, ROLE_LABELS, ROLE_VARIANTS, UserRole } from './users-admin.service';
import { CreateEmployeeDrawer } from './create-employee-drawer/create-employee-drawer';
import { CreateUserDrawer } from './create-user-drawer/create-user-drawer';
import { EditUserDrawer } from './edit-user-drawer/edit-user-drawer';
import { PermissionsService } from '@core/auth/permissions.service';

@Component({
  selector: 'app-users-page',
  imports: [
    CommonModule, ReactiveFormsModule,
    Avatar, Badge, Banner, Button, EmptyState, FilterChips,
    LoadingSkeleton, PageHeader, SectionCard, StatCard, AppInput,
    CreateEmployeeDrawer, CreateUserDrawer, EditUserDrawer,
  ],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss',
})
export class UsersPage implements OnInit {
  private readonly svc        = inject(UsersAdminService);
  private readonly destroyRef = inject(DestroyRef);
  readonly perms              = inject(PermissionsService);

  readonly users        = signal<UserListItem[]>([]);
  readonly isLoading    = signal(true);
  readonly loadError    = signal('');
  readonly search       = signal('');
  readonly activeFilter = signal<'all' | 'employees' | 'system' | 'inactive'>('all');
  readonly searchCtrl   = new FormControl('');

  showEmployeeDrawer = signal(false);
  showUserDrawer     = signal(false);
  showEditDrawer     = signal(false);
  editTarget         = signal<UserListItem | null>(null);

  readonly filterChips = computed((): FilterChipItem[] => [
    { id: 'all',       label: 'Todos',             icon: 'people',         count: this.users().length },
    { id: 'employees', label: 'Con ficha',          icon: 'badge',          count: this.users().filter(u => !!u.employee).length },
    { id: 'system',    label: 'Solo sistema',       icon: 'manage_accounts',count: this.users().filter(u => !u.employee).length },
    { id: 'inactive',  label: 'Inactivos',          icon: 'block',          count: this.users().filter(u => !u.isActive).length },
  ]);

  readonly filtered = computed(() => {
    let list = this.users();
    const q = this.search().toLowerCase().trim();
    const f = this.activeFilter();

    if (f === 'employees') list = list.filter(u => !!u.employee);
    if (f === 'system')    list = list.filter(u => !u.employee);
    if (f === 'inactive')  list = list.filter(u => !u.isActive);

    if (q) {
      list = list.filter(u =>
        u.email.toLowerCase().includes(q) ||
        (u.employee ? `${u.employee.firstName} ${u.employee.lastName}`.toLowerCase().includes(q) : false) ||
        (u.employee?.position?.name?.toLowerCase().includes(q) ?? false) ||
        (u.employee?.department?.name?.toLowerCase().includes(q) ?? false),
      );
    }
    return list;
  });

  readonly totalActive   = computed(() => this.users().filter(u => u.isActive).length);
  readonly totalAdmins   = computed(() => this.users().filter(u => u.role === 'COMPANY_ADMIN' || u.role === 'HR_MANAGER').length);
  readonly totalSystem   = computed(() => this.users().filter(u => !u.employee).length);

  ngOnInit(): void {
    this.searchCtrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(q => this.search.set(q ?? ''));
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.svc.listUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:  list => { this.users.set(list); this.isLoading.set(false); },
      error: err  => { this.isLoading.set(false); this.loadError.set(err?.error?.message ?? 'Error al cargar los usuarios.'); },
    });
  }

  toggleStatus(user: UserListItem): void {
    this.svc.toggleStatus(user.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: updated => this.users.update(list => list.map(u => u.id === updated.id ? { ...u, ...updated } : u)),
    });
  }

  onEmployeeCreated(): void {
    this.showEmployeeDrawer.set(false);
    this.loadUsers();
  }

  onUserCreated(): void {
    this.showUserDrawer.set(false);
    this.loadUsers();
  }

  openEdit(u: UserListItem): void {
    this.editTarget.set(u);
    this.showEditDrawer.set(true);
  }

  onUserUpdated(): void {
    this.showEditDrawer.set(false);
    this.loadUsers();
  }

  displayName(u: UserListItem): string {
    if (u.employee) return `${u.employee.firstName} ${u.employee.lastName}`;
    if (u.firstName) return `${u.firstName} ${u.lastName ?? ''}`.trim();
    return u.email.split('@')[0];
  }

  roleLabel(role: UserRole): string  { return ROLE_LABELS[role]; }
  roleVariant(role: UserRole): 'primary' | 'success' | 'warning' | 'neutral' | 'error' {
    return ROLE_VARIANTS[role];
  }
}

import { Component, Input, Output, EventEmitter, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Drawer, AppInput, AppSelect, Button, Banner, FormRow, FormSection } from '@shared/ui';
import type { SelectOption } from '@shared/ui';
import { UsersAdminService, ROLE_LABELS, UserRole } from '../users-admin.service';

@Component({
  selector: 'app-create-user-drawer',
  imports: [CommonModule, ReactiveFormsModule, Drawer, AppInput, AppSelect, Button, Banner, FormRow, FormSection],
  templateUrl: './create-user-drawer.html',
  styleUrl: './create-user-drawer.scss',
})
export class CreateUserDrawer {
  @Input({ required: true }) isOpen = false;
  @Output() close   = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private readonly fb         = inject(FormBuilder);
  private readonly svc        = inject(UsersAdminService);
  private readonly destroyRef = inject(DestroyRef);

  saving   = false;
  errorMsg = '';
  success  = false;
  createdEmail = '';

  readonly roleOptions: SelectOption[] = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    role:      ['HR_ANALYST', Validators.required],
    password:  ['', [Validators.required, Validators.minLength(8)]],
  });

  invalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.errorMsg = '';

    const v = this.form.value;
    this.svc.createSystemUser({
      firstName: v.firstName!,
      lastName:  v.lastName!,
      email:     v.email!,
      role:      v.role as UserRole,
      password:  v.password!,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        this.saving = false;
        this.success = true;
        this.createdEmail = res.email;
      },
      error: err => {
        this.saving   = false;
        this.errorMsg = err?.error?.message ?? 'Error al crear el usuario.';
      },
    });
  }

  confirmSuccess(): void {
    this.success = false;
    this.created.emit();
    this.reset();
  }

  onClose(): void {
    this.reset();
    this.close.emit();
  }

  private reset(): void {
    this.errorMsg = '';
    this.success  = false;
    this.form.reset({ role: 'HR_ANALYST' });
  }
}

import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Drawer, AppInput, AppSelect, Button, Banner, FormRow, FormSection } from '@shared/ui';
import type { SelectOption } from '@shared/ui';
import { UsersAdminService, SystemUserType } from '../users-admin.service';

@Component({
  selector: 'app-create-user-drawer',
  imports: [CommonModule, ReactiveFormsModule, Drawer, AppInput, AppSelect, Button, Banner, FormRow, FormSection],
  templateUrl: './create-user-drawer.html',
  styleUrl: './create-user-drawer.scss',
})
export class CreateUserDrawer implements OnChanges {
  @Input({ required: true }) isOpen = false;
  @Output() close   = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private readonly fb         = inject(FormBuilder);
  private readonly svc        = inject(UsersAdminService);
  private readonly destroyRef = inject(DestroyRef);

  saving      = false;
  loadingTypes = false;
  errorMsg    = '';
  success     = false;
  createdEmail = '';

  readonly userTypes    = signal<SystemUserType[]>([]);
  readonly typeOptions  = signal<SelectOption[]>([]);
  selectedType          = signal<SystemUserType | null>(null);

  form = this.fb.group({
    firstName:        ['', Validators.required],
    lastName:         ['', Validators.required],
    email:            ['', [Validators.required, Validators.email]],
    systemUserTypeId: ['', Validators.required],
    password:         ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true && this.userTypes().length === 0) {
      this.loadTypes();
    }
  }

  private loadTypes(): void {
    this.loadingTypes = true;
    this.svc.listSystemUserTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: types => {
          this.loadingTypes = false;
          const active = types.filter(t => t.isActive);
          this.userTypes.set(active);
          this.typeOptions.set(active.map(t => ({ value: t.id, label: t.name })));
          // listen to form control changes to update preview
          this.form.get('systemUserTypeId')!.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(id => {
              this.selectedType.set(active.find(t => t.id === id) ?? null);
            });
        },
        error: () => { this.loadingTypes = false; },
      });
  }

  invalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving   = true;
    this.errorMsg = '';

    const v = this.form.value;
    this.svc.createSystemUser({
      firstName:        v.firstName!,
      lastName:         v.lastName!,
      email:            v.email!,
      systemUserTypeId: v.systemUserTypeId!,
      password:         v.password!,
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
    this.selectedType.set(null);
    this.form.reset();
  }
}

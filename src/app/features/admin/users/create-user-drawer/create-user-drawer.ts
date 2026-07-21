import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Drawer, AppInput, AppSelect, Button, Banner, ColGrid, FormSection,
  SuccessScreen, TypePreview, LoadingSkeleton } from '@shared/ui';
import type { SelectOption } from '@shared/ui';
import { UsersAdminService, SystemUserType } from '../users-admin.service';

@Component({
  selector: 'app-create-user-drawer',
  imports: [CommonModule, ReactiveFormsModule, Drawer, AppInput, AppSelect, Button, Banner, ColGrid, FormSection,
    SuccessScreen, TypePreview, LoadingSkeleton],
  templateUrl: './create-user-drawer.html',
})
export class CreateUserDrawer implements OnChanges {
  @Input({ required: true }) isOpen = false;
  @Output() close   = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private readonly fb         = inject(FormBuilder);
  private readonly svc        = inject(UsersAdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly saving       = signal(false);
  readonly loadingTypes = signal(false);
  readonly errorMsg     = signal('');
  readonly success      = signal(false);
  readonly createdEmail = signal('');

  readonly userTypes   = signal<SystemUserType[]>([]);
  readonly typeOptions = signal<SelectOption[]>([]);
  readonly selectedType = signal<SystemUserType | null>(null);

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
    this.loadingTypes.set(true);
    this.svc.listSystemUserTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: types => {
          this.loadingTypes.set(false);
          const active = types.filter(t => t.isActive);
          this.userTypes.set(active);
          this.typeOptions.set(active.map(t => ({ value: t.id, label: t.name })));
          this.form.get('systemUserTypeId')!.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(id => {
              this.selectedType.set(active.find(t => t.id === id) ?? null);
            });
        },
        error: () => { this.loadingTypes.set(false); },
      });
  }

  invalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.errorMsg.set('');

    const v = this.form.value;
    this.svc.createSystemUser({
      firstName:        v.firstName!,
      lastName:         v.lastName!,
      email:            v.email!,
      systemUserTypeId: v.systemUserTypeId!,
      password:         v.password!,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        this.saving.set(false);
        this.success.set(true);
        this.createdEmail.set(res.email);
      },
      error: err => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Error al crear el usuario.');
      },
    });
  }

  confirmSuccess(): void {
    this.success.set(false);
    this.created.emit();
    this.reset();
  }

  onClose(): void {
    this.reset();
    this.close.emit();
  }

  private reset(): void {
    this.errorMsg.set('');
    this.success.set(false);
    this.selectedType.set(null);
    this.form.reset();
  }
}

import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Drawer, AppSelect, Button, Banner, FormSection, TypePreview, LoadingSkeleton } from '@shared/ui';
import type { SelectOption } from '@shared/ui';
import { UsersAdminService, UserListItem, SystemUserType } from '../users-admin.service';

@Component({
  selector: 'app-edit-user-drawer',
  imports: [CommonModule, ReactiveFormsModule, Drawer, AppSelect, Button, Banner, FormSection,
    TypePreview, LoadingSkeleton],
  templateUrl: './edit-user-drawer.html',
})
export class EditUserDrawer implements OnChanges {
  @Input({ required: true }) isOpen = false;
  @Input() user: UserListItem | null = null;
  @Output() close   = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  private readonly fb         = inject(FormBuilder);
  private readonly svc        = inject(UsersAdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly saving       = signal(false);
  readonly loadingTypes = signal(false);
  readonly errorMsg     = signal('');
  readonly userTypes    = signal<SystemUserType[]>([]);
  readonly typeOptions  = signal<SelectOption[]>([]);
  readonly selectedType = signal<SystemUserType | null>(null);

  form = this.fb.group({
    systemUserTypeId: ['', Validators.required],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true && this.user) {
      this.errorMsg.set('');
      if (this.userTypes().length === 0) this.loadTypes();
      else this.patchForm();
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
          this.patchForm();
          this.form.get('systemUserTypeId')!.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(id => this.selectedType.set(active.find(t => t.id === id) ?? null));
        },
        error: () => this.loadingTypes.set(false),
      });
  }

  private patchForm(): void {
    const currentTypeId = this.user?.systemUserType?.id ?? '';
    this.form.patchValue({ systemUserTypeId: currentTypeId });
    const current = this.userTypes().find(t => t.id === currentTypeId) ?? null;
    this.selectedType.set(current);
  }

  get displayName(): string {
    if (!this.user) return '';
    if (this.user.firstName) return `${this.user.firstName} ${this.user.lastName ?? ''}`.trim();
    return this.user.email.split('@')[0];
  }

  get hasChanged(): boolean {
    return this.form.value.systemUserTypeId !== (this.user?.systemUserType?.id ?? '');
  }

  submit(): void {
    if (this.form.invalid || !this.user || !this.hasChanged) return;
    this.saving.set(true);
    this.errorMsg.set('');
    this.svc.updateUserType(this.user.id, this.form.value.systemUserTypeId!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.saving.set(false); this.updated.emit(); this.onClose(); },
        error: err => { this.saving.set(false); this.errorMsg.set(err?.error?.message ?? 'Error al actualizar.'); },
      });
  }

  onClose(): void {
    this.errorMsg.set('');
    this.close.emit();
  }
}

import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Button, Field, SectionCard, AppInput, Banner } from '@shared/ui';
import { ToolbarLayout } from '@shared/layout';
import { CollaboratorService } from '@features/portal/services/collaborator.service';
import { ProfileUpdateRequest } from '@features/portal/models/profile-update.model';

@Component({
  selector: 'app-mis-datos',
  imports: [Banner, ToolbarLayout, AppInput, Button, CommonModule, ReactiveFormsModule, SectionCard, Field],
  templateUrl: './mis-datos.html',
  styleUrl: './mis-datos.scss',
})
export class MisDatos {
  private readonly fb                  = inject(FormBuilder);
  private readonly collaboratorService = inject(CollaboratorService);

  readonly isEditing    = signal(false);
  readonly isSubmitting = signal(false);

  readonly profile           = toSignal(this.collaboratorService.getProfile());
  readonly hasPendingRequest = toSignal(this.collaboratorService.hasPendingProfileUpdate(), { initialValue: false });

  editForm: FormGroup = this.fb.group({
    firstName:    ['', Validators.required],
    middleName:   [''],
    lastName:     ['', Validators.required],
    secondLastName: [''],
    documentType: [{ value: 'DNI', disabled: true }],
    documentId:   [''],
    birthDate:    [''],
    personalEmail:['', Validators.email],
    phone:        [''],
  });

  constructor() {
    effect(() => {
      const data = this.profile();
      if (data) this.editForm.patchValue(data);
    });
  }

  toggleEditMode(): void {
    if (this.hasPendingRequest()) return;
    this.isEditing.update(v => !v);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    const data = this.profile();
    if (data) this.editForm.patchValue(data);
  }

  submitRequest(): void {
    if (this.editForm.invalid) return;
    this.isSubmitting.set(true);

    const payload: ProfileUpdateRequest = {
      type:   'PROFILE_UPDATE',
      data:   this.editForm.value,
      reason: 'Actualización de datos personales por el colaborador',
    };

    this.collaboratorService.requestProfileUpdate(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isEditing.set(false);
        window.location.reload();
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Button, Field, SectionCard, Modal } from '@shared/ui';
import { SplitLayout } from '@shared/ui';
import { MapWidget } from '@shared/ui';
import { InputField } from '@shared/ui';
import { ToolbarLayout } from '@shared/layout';
import { CollaboratorService } from '@features/portal/services/collaborator.service';

@Component({
  selector: 'app-direccion',
  imports: [ReactiveFormsModule, Button, Modal, ToolbarLayout, CommonModule, SectionCard, Field, SplitLayout, MapWidget, InputField],
  templateUrl: './direccion.html',
  styleUrl: './direccion.scss',
})
export class Direccion {
  private readonly fb                  = inject(FormBuilder);
  private readonly collaboratorService = inject(CollaboratorService);

  readonly isModalOpen  = signal(false);
  readonly isSubmitting = signal(false);
  readonly profile      = toSignal(this.collaboratorService.getProfile());

  addressForm: FormGroup = this.fb.group({
    country:    ['Perú', Validators.required],
    department: ['', Validators.required],
    district:   ['', Validators.required],
    street:     ['', Validators.required],
    number:     [''],
    reference:  [''],
  });

  openModal(): void {
    const currentAddress = this.profile()?.address || '';
    if (currentAddress) this.addressForm.patchValue({ street: currentAddress });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.addressForm.reset({ country: 'Perú' });
  }

  submitAddressUpdate(): void {
    if (this.addressForm.invalid) return;
    this.isSubmitting.set(true);

    const f = this.addressForm.value;
    let fullAddress = `${f.street} ${f.number}, ${f.district}, ${f.department}, ${f.country}`;
    if (f.reference) fullAddress += ` (Ref: ${f.reference})`;

    this.collaboratorService.updateProfile({ address: fullAddress }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal();
        window.location.reload();
      },
      error: (err) => {
        console.error('Error al actualizar dirección:', err);
        this.isSubmitting.set(false);
      },
    });
  }
}

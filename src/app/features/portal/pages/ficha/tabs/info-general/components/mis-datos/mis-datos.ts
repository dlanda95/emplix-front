import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../../../../../../../../shared/components/ui/button/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
// Importamos tus UI Kits Globales

import { Field } from '../../../../../../../../shared/components/ui/field/field';
import { SectionCard } from '../../../../../../../../shared/components/ui/section-card/section-card';
 import { SplitLayout } from '../../../../../../../../shared/components/ui/split-layout/split-layout';
import { Badge } from '../../../../../../../../shared/components/ui/badge/badge';
import { AppInput } from '../../../../../../../../shared/components/ui/input/input';

import { ToolbarLayout } from '../../../../../../../../shared/components/layout/toolbar-layout/toolbar-layout';
import { Banner } from '../../../../../../../../shared/components/ui/banner/banner';
import { CollaboratorService } from '../../../../../../core/services/collaborator.service';
@Component({
  selector: 'app-mis-datos',
  imports: [Banner, ToolbarLayout,AppInput,Button,CommonModule,ReactiveFormsModule, Badge, SplitLayout,SectionCard, Field],
  templateUrl: './mis-datos.html',
  styleUrl: './mis-datos.scss',
})
export class MisDatos {private fb = inject(FormBuilder);
  private collaboratorService = inject(CollaboratorService);

  // Estados
  isEditing = signal(false);
  hasPendingRequest = signal(false); // Simular o traer de BD
  isSubmitting = signal(false);

  // Datos Originales
  profile = toSignal(this.collaboratorService.getProfile());

  // Formulario Reactivo
 editForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    middleName: [''],
    lastName: ['', Validators.required],
    secondLastName: [''],
    // 🔥 Agregamos el campo deshabilitado aquí:
    documentType: [{ value: 'DNI', disabled: true }], 
    documentId: [''],
    birthDate: [''],
    personalEmail: ['', Validators.email],
    phone: ['']
  });

  constructor() {
    // Efecto para llenar el formulario cuando lleguen los datos del backend
    effect(() => {
      const data = this.profile();
      if (data) {
        this.editForm.patchValue({
          firstName: data.firstName,
          middleName: data.middleName || '',
          lastName: data.lastName,
          secondLastName: data.secondLastName || '',
          documentId: data.documentId || '',
          birthDate: data.birthDate || '',
          personalEmail: data.personalEmail || '',
          phone: data.phone || ''
        });
      }
    });

    // TODO: Aquí podrías suscribirte a this.collaboratorService.getPendingProfileUpdate() 
    // y si existe, hacer this.hasPendingRequest.set(true);
  }

  toggleEditMode() {
    if (this.hasPendingRequest()) return;
    this.isEditing.update(v => !v);
  }

  cancelEdit() {
    this.isEditing.set(false);
    // Restaurar valores originales
    if (this.profile()) this.editForm.patchValue(this.profile()!); 
  }

  submitRequest() {
    if (this.editForm.invalid) return;

    this.isSubmitting.set(true);
    
    const payload = this.editForm.value;

    this.collaboratorService.requestProfileUpdate({
      type: 'PROFILE_UPDATE',
      payload: payload
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isEditing.set(false);
        this.hasPendingRequest.set(true); // Bloquear futuras ediciones
        // Mostrar un Toast o mensaje de éxito
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting.set(false);
        // Mostrar Toast de error
      }
    });
  }
}

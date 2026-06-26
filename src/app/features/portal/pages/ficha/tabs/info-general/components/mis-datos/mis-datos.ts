import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppInput, AppSelect, Banner, Button, EditBar, Field, SectionCard } from '@shared/ui';
import { CollaboratorService } from '@features/portal/services/collaborator.service';
import { CollaboratorProfile } from '@features/portal/models/collaborator.model';
import { ProfileUpdateRequest } from '@features/portal/models/profile-update.model';
import {
  GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, ACADEMIC_LEVEL_OPTIONS, DOCUMENT_TYPE_OPTIONS,
  CatalogOption, catalogLabel,
} from '@features/portal/models/catalog.model';

@Component({
  selector: 'app-mis-datos',
  imports: [AppInput, AppSelect, Banner, Button, CommonModule, EditBar, Field, ReactiveFormsModule, SectionCard],
  templateUrl: './mis-datos.html',
  styleUrl: './mis-datos.scss',
})
export class MisDatos {
  private readonly fb                  = inject(FormBuilder);
  private readonly collaboratorService = inject(CollaboratorService);

  readonly isEditing         = signal(false);
  readonly isSubmitting      = signal(false);
  readonly hasPendingRequest = signal(false);
  readonly profile           = signal<CollaboratorProfile | undefined>(undefined);

  readonly genderOptions        = GENDER_OPTIONS;
  readonly maritalStatusOptions = MARITAL_STATUS_OPTIONS;
  readonly academicLevelOptions = ACADEMIC_LEVEL_OPTIONS;
  readonly documentTypeOptions  = DOCUMENT_TYPE_OPTIONS;

  editForm: FormGroup = this.fb.group({
    firstName:     ['', Validators.required],
    middleName:    [''],
    lastName:      ['', Validators.required],
    secondLastName:[''],
    documentType:  ['DNI'],
    documentId:    [''],
    birthDate:     [''],
    gender:        [''],
    maritalStatus: [''],
    nationality:   [''],
    academicLevel: [''],
    birthCountry:  [''],
    birthRegion:   [''],
    birthDistrict: [''],
    licenseNumber: [''],
    altDocId:      [''],
    docAddress:    [''],
    docDistrict:   [''],
    docDepartment: [''],
    docAddressRef: [''],
  });

  constructor() {
    this.loadProfile();

    effect(() => {
      const data = this.profile();
      if (data) this.editForm.patchValue(data);
    });
  }

  requestEditMode(): void {
    if (!this.hasPendingRequest() && !this.isEditing()) {
      this.isEditing.set(true);
    }
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
        this.loadProfile();
      },
      error: () => this.isSubmitting.set(false),
    });
  }

  // Helpers de presentación para valores de catálogo
  documentTypeLabel(val: string | null | undefined): string {
    return catalogLabel(DOCUMENT_TYPE_OPTIONS, val);
  }

  genderLabel(val: string | null | undefined): string {
    return catalogLabel(GENDER_OPTIONS, val);
  }

  maritalStatusLabel(val: string | null | undefined): string {
    return catalogLabel(MARITAL_STATUS_OPTIONS, val);
  }

  academicLevelLabel(val: string | null | undefined): string {
    return catalogLabel(ACADEMIC_LEVEL_OPTIONS, val);
  }

  private loadProfile(): void {
    this.collaboratorService.getProfile().subscribe({
      next: profile => this.profile.set(profile),
    });

    this.collaboratorService.hasPendingProfileUpdate().subscribe({
      next: hasPending => this.hasPendingRequest.set(hasPending),
    });
  }
}

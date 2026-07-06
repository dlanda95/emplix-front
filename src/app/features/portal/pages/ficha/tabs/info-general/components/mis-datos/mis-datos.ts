import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { pastDateValidator } from '@shared/validators/date-range.validator';
import { AppInput, AppSelect, ChangeRequestBar, Field, SectionCard } from '@shared/ui';
import { CollaboratorService } from '@features/portal/services/collaborator.service';
import { CollaboratorProfile } from '@features/portal/models/collaborator.model';
import { ProfileUpdateRequest } from '@features/portal/models/profile-update.model';
import {
  GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, ACADEMIC_LEVEL_OPTIONS, DOCUMENT_TYPE_OPTIONS,
  catalogLabel,
} from '@features/portal/models/catalog.model';

const norm = (v: unknown): string | null =>
  (v === null || v === undefined || v === '') ? null : String(v);

@Component({
  selector: 'app-mis-datos',
  imports: [AppInput, AppSelect, ChangeRequestBar, CommonModule, Field, ReactiveFormsModule, SectionCard],
  templateUrl: './mis-datos.html',
  styleUrl: './mis-datos.scss',
})
export class MisDatos {
  private readonly fb                  = inject(FormBuilder);
  private readonly collaboratorService = inject(CollaboratorService);

  readonly isEditing         = signal(false);
  readonly isSubmitting      = signal(false);
  readonly isPending         = signal(false);
  readonly profile           = signal<CollaboratorProfile | undefined>(undefined);

  readonly today                = new Date().toISOString().slice(0, 10);
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
    birthDate:     ['', pastDateValidator],
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

  cancelEdit(): void {
    this.isEditing.set(false);
    const data = this.profile();
    if (data) this.editForm.patchValue(data);
  }

  submitRequest(): void {
    if (this.editForm.invalid) return;
    this.isSubmitting.set(true);

    const current   = this.profile() as Record<string, unknown> | undefined;
    const formValue = this.editForm.value as Record<string, unknown>;

    // Solo enviar campos que realmente cambiaron — evita unique constraint en campos como documentId
    const changed: Record<string, unknown> = {};
    for (const key of Object.keys(formValue)) {
      const oldVal = norm(current?.[key]);
      const newVal = norm(formValue[key]);
      if (oldVal !== newVal) changed[key] = formValue[key];
    }

    if (Object.keys(changed).length === 0) {
      this.isSubmitting.set(false);
      this.isEditing.set(false);
      return;
    }

    const payload: ProfileUpdateRequest = {
      type:   'PROFILE_UPDATE',
      data:   { ...changed, _previous: current ?? {} } as any,
      reason: 'Actualización de datos personales por el colaborador',
    };

    this.collaboratorService.requestProfileUpdate(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isEditing.set(false);
        this.isPending.set(true);
      },
      error: () => this.isSubmitting.set(false),
    });
  }

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
    this.collaboratorService.hasPendingForSection('personal').subscribe({
      next: pending => this.isPending.set(pending),
    });
  }
}

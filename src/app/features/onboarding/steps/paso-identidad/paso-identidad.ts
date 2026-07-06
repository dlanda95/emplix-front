import { Component, inject, signal, effect, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { pastDateValidator } from '@shared/validators/date-range.validator';
import { AppInput, AppSelect, Banner, Button, SectionCard } from '@shared/ui';
import { OnboardingService } from '../../services/onboarding.service';
import { DOCUMENT_TYPE_OPTIONS, GENDER_OPTIONS, MARITAL_STATUS_OPTIONS,
         ACADEMIC_LEVEL_OPTIONS } from '@features/portal/models/catalog.model';

@Component({
  selector: 'app-paso-identidad',
  imports: [ReactiveFormsModule, AppInput, AppSelect, Banner, Button, SectionCard],
  templateUrl: './paso-identidad.html',
  styleUrl: './paso-identidad.scss',
})
export class PasoIdentidad {
  private readonly fb      = inject(FormBuilder);
  readonly svc             = inject(OnboardingService);
  readonly isSaving    = signal(false);
  readonly saved       = signal(false);
  readonly today       = new Date().toISOString().slice(0, 10);
  readonly saveError   = signal('');

  readonly isDirty   = computed(() => this.svc.isDirty(this.STEP_KEY));
  readonly showSave  = computed(() => !this.svc.isStepSaved(this.STEP_KEY) || this.isDirty());

  readonly documentTypes   = DOCUMENT_TYPE_OPTIONS;
  readonly genderOptions   = GENDER_OPTIONS;
  readonly maritalOptions  = MARITAL_STATUS_OPTIONS;
  readonly academicOptions = ACADEMIC_LEVEL_OPTIONS;

  form = this.fb.group({
    firstName:     ['', Validators.required],
    middleName:    [''],
    lastName:      ['', Validators.required],
    secondLastName:[''],
    documentType:  ['DNI', Validators.required],
    documentId:    ['', Validators.required],
    birthDate:     ['', pastDateValidator],
    gender:        [''],
    maritalStatus: [''],
    nationality:   ['Peruana'],
    academicLevel: [''],
    licenseNumber: [''],
    birthCountry:  ['Perú'],
    birthRegion:   [''],
    birthDistrict: [''],
    // Dirección del documento de identidad
    docAddress:    [''],
    docDistrict:   [''],
    docDepartment: [''],
    docAddressRef: [''],
  });

  private readonly STEP_KEY = 'identidad';

  constructor() {
    effect(() => {
      const p = this.svc.profile();
      if (!p) return;
      const draft = this.svc.getDraft(this.STEP_KEY);
      const values = draft ?? { ...p, birthDate: p.birthDate?.slice(0, 10) ?? '' };
      this.form.patchValue(values as any, { emitEvent: false });
    });

    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(v => {
      this.svc.setDraft(this.STEP_KEY, v as Record<string, unknown>);
      this.svc.markDirty(this.STEP_KEY);
    });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving.set(true);
    this.saveError.set('');
    this.svc.saveData(this.form.value as Record<string, unknown>).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saved.set(true);
        this.svc.markSaved(this.STEP_KEY);
        setTimeout(() => this.saved.set(false), 2500);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.saveError.set(err?.error?.message ?? 'Error al guardar. Intenta nuevamente.');
      },
    });
  }
}

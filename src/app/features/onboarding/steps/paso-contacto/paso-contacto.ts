import { Component, inject, signal, effect, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AppInput, Button, SectionCard } from '@shared/ui';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'app-paso-contacto',
  imports: [ReactiveFormsModule, AppInput, Button, SectionCard],
  templateUrl: './paso-contacto.html',
  styleUrl: './paso-contacto.scss',
})
export class PasoContacto {
  private readonly fb = inject(FormBuilder);
  readonly svc        = inject(OnboardingService);
  readonly isSaving   = signal(false);
  readonly saved      = signal(false);

  readonly isDirty  = computed(() => this.svc.isDirty(this.STEP_KEY));
  readonly showSave = computed(() => !this.svc.isStepSaved(this.STEP_KEY) || this.isDirty());

  form = this.fb.group({
    phone:        [''],
    cellPhone:    [''],
    personalEmail:[''],
    emergencyName: [''],
    emergencyRel:  [''],
    emergencyPhone:[''],
  });

  private readonly STEP_KEY = 'contacto';

  constructor() {
    effect(() => {
      const p = this.svc.profile();
      if (!p) return;
      const values = this.svc.getDraft(this.STEP_KEY) ?? (p as any);
      this.form.patchValue(values as any, { emitEvent: false });
    });

    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(v => {
      this.svc.setDraft(this.STEP_KEY, v as Record<string, unknown>);
      this.svc.markDirty(this.STEP_KEY);
    });
  }

  save(): void {
    this.isSaving.set(true);
    this.svc.saveData(this.form.value as Record<string, unknown>).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saved.set(true);
        this.svc.markSaved(this.STEP_KEY);
        setTimeout(() => this.saved.set(false), 2500);
      },
      error: () => this.isSaving.set(false),
    });
  }
}

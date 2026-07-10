import { Component, inject, signal, effect, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AppInput, AppSelect, Button, SectionCard } from '@shared/ui';
import { OnboardingService } from '../../services/onboarding.service';
import { AFP_TYPE_OPTIONS, AFP_ENTITY_OPTIONS, AFP_COMMISSION_OPTIONS } from '@features/portal/models/catalog.model';

@Component({
  selector: 'app-paso-financiero',
  imports: [ReactiveFormsModule, AppInput, AppSelect, Button, SectionCard],
  templateUrl: './paso-financiero.html',
})
export class PasoFinanciero {
  private readonly fb = inject(FormBuilder);
  readonly svc        = inject(OnboardingService);
  readonly isSaving   = signal(false);
  readonly saved      = signal(false);

  readonly isDirty  = computed(() => this.svc.isDirty(this.STEP_KEY));
  readonly showSave = computed(() => !this.svc.isStepSaved(this.STEP_KEY) || this.isDirty());

  readonly afpTypeOptions       = AFP_TYPE_OPTIONS;
  readonly afpEntityOptions     = AFP_ENTITY_OPTIONS;
  readonly afpCommissionOptions = AFP_COMMISSION_OPTIONS;

  form = this.fb.group({
    afpType:       [''],
    afpEntity:     [''],
    afpCommission: [''],
    bankEntity:    [''],
    bankAccount:   [''],
    bankCci:       [''],
  });

  readonly isAfp = computed(() => this.form.get('afpType')?.value === 'AFP');

  private readonly STEP_KEY = 'financiero';

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

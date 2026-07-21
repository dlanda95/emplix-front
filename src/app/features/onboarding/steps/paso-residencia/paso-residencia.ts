import { Component, inject, signal, effect, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AppInput, Banner, Button, LocationCascade, SectionCard } from '@shared/ui';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'app-paso-residencia',
  imports: [ReactiveFormsModule, AppInput, Banner, Button, LocationCascade, SectionCard],
  templateUrl: './paso-residencia.html',
})
export class PasoResidencia {
  private readonly fb = inject(FormBuilder);
  readonly svc        = inject(OnboardingService);
  readonly isSaving   = signal(false);
  readonly saved      = signal(false);
  readonly sameAsDoc  = signal(false);

  readonly isDirty  = computed(() => this.svc.isDirty(this.STEP_KEY));
  readonly showSave = computed(() => !this.svc.isStepSaved(this.STEP_KEY) || this.isDirty());

  form = this.fb.group({
    address:        [''],
    district:       [''],
    province:       [''],
    departmentdirec:[''],
    addressRef:     [''],
  });

  private readonly STEP_KEY = 'residencia';

  constructor() {
    effect(() => {
      const p = this.svc.profile();
      if (!p) return;
      const draft = this.svc.getDraft(this.STEP_KEY);
      const values = draft ?? {
        address:         p.address         ?? '',
        district:        p.district        ?? '',
        province:        p.province        ?? '',
        departmentdirec: p.departmentdirec ?? '',
        addressRef:      p.addressRef      ?? '',
      };
      this.form.patchValue(values as any, { emitEvent: false });
    });

    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(v => {
      this.svc.setDraft(this.STEP_KEY, v as Record<string, unknown>);
      this.svc.markDirty(this.STEP_KEY);
    });
  }

  toggleSameAsDoc(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const p       = this.svc.profile();
    this.sameAsDoc.set(checked);
    if (checked && p?.docAddress) {
      this.form.patchValue({
        address:         p.docAddress    ?? '',
        district:        p.docDistrict   ?? '',
        province:        '',
        departmentdirec: p.docDepartment ?? '',
        addressRef:      p.docAddressRef ?? '',
      });
      this.form.disable();
    } else {
      this.form.enable();
      if (!checked && p) {
        this.form.patchValue({
          address:         p.address         ?? '',
          district:        p.district        ?? '',
          province:        p.province        ?? '',
          departmentdirec: p.departmentdirec ?? '',
          addressRef:      p.addressRef      ?? '',
        });
      }
    }
  }

  save(): void {
    this.isSaving.set(true);
    this.svc.saveData(this.form.getRawValue() as Record<string, unknown>).subscribe({
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

import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppInput, AppSelect, Button, Field, FormRow, FormSection, Modal, PageHeader, SectionCard } from '@shared/ui';
import { ToolbarLayout } from '@shared/layout';
import { CollaboratorService } from '@features/portal/services/collaborator.service';
import { CollaboratorProfile } from '@features/portal/models/collaborator.model';
import {
  AFP_TYPE_OPTIONS, AFP_ENTITY_OPTIONS, AFP_COMMISSION_OPTIONS, catalogLabel,
} from '@features/portal/models/catalog.model';

@Component({
  selector: 'app-financiero',
  imports: [
    CommonModule, ReactiveFormsModule,
    AppInput, AppSelect, Button, Field, FormRow, FormSection, Modal, PageHeader, SectionCard, ToolbarLayout,
  ],
  templateUrl: './financiero.html',
  styleUrl: './financiero.scss',
})
export class Financiero {
  private readonly fb                  = inject(FormBuilder);
  private readonly collaboratorService = inject(CollaboratorService);

  readonly isModalOpen  = signal(false);
  readonly isSubmitting = signal(false);
  readonly profile      = signal<CollaboratorProfile | undefined>(undefined);

  readonly afpTypeOptions       = AFP_TYPE_OPTIONS;
  readonly afpEntityOptions     = AFP_ENTITY_OPTIONS;
  readonly afpCommissionOptions = AFP_COMMISSION_OPTIONS;

  finForm: FormGroup = this.fb.group({
    afpType:       [''],
    afpEntity:     [''],
    afpCommission: [''],
    bankEntity:    ['', Validators.required],
    bankAccount:   ['', Validators.required],
    bankCci:       [''],
  });

  readonly isAfp = computed(() => this.finForm.get('afpType')?.value === 'AFP');

  constructor() {
    this.loadProfile();

    effect(() => {
      const data = this.profile();
      if (data) {
        this.finForm.patchValue({
          afpType:       data.afpType,
          afpEntity:     data.afpEntity,
          afpCommission: data.afpCommission,
          bankEntity:    data.bankEntity,
          bankAccount:   data.bankAccount,
          bankCci:       data.bankCci,
        });
      }
    });
  }

  openModal(): void { this.isModalOpen.set(true); }

  closeModal(): void {
    this.isModalOpen.set(false);
    const data = this.profile();
    if (data) this.finForm.patchValue({
      afpType:       data.afpType,
      afpEntity:     data.afpEntity,
      afpCommission: data.afpCommission,
      bankEntity:    data.bankEntity,
      bankAccount:   data.bankAccount,
      bankCci:       data.bankCci,
    });
  }

  submit(): void {
    if (this.finForm.invalid) return;
    this.isSubmitting.set(true);

    this.collaboratorService.updateProfile(this.finForm.value).subscribe({
      next: updated => {
        this.profile.set(updated);
        this.isSubmitting.set(false);
        this.closeModal();
      },
      error: () => this.isSubmitting.set(false),
    });
  }

  afpTypeLabel(val: string | null | undefined): string {
    return catalogLabel(AFP_TYPE_OPTIONS, val);
  }

  afpEntityLabel(val: string | null | undefined): string {
    return catalogLabel(AFP_ENTITY_OPTIONS, val);
  }

  afpCommissionLabel(val: string | null | undefined): string {
    return catalogLabel(AFP_COMMISSION_OPTIONS, val);
  }

  private loadProfile(): void {
    this.collaboratorService.getProfile().subscribe({
      next: profile => this.profile.set(profile),
    });
  }
}

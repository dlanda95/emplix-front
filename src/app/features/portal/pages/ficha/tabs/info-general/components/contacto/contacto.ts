import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button, Field, FormRow, FormSection, AppInput, Modal, PageHeader, SectionCard } from '@shared/ui';
import { ToolbarLayout } from '@shared/layout';
import { CollaboratorService } from '@features/portal/services/collaborator.service';
import { CollaboratorProfile } from '@features/portal/models/collaborator.model';

@Component({
  selector: 'app-contacto',
  imports: [
    CommonModule, ReactiveFormsModule,
    AppInput, Button, Field, FormRow, FormSection, Modal, PageHeader, SectionCard, ToolbarLayout,
  ],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss',
})
export class Contacto {
  private readonly fb                  = inject(FormBuilder);
  private readonly collaboratorService = inject(CollaboratorService);

  readonly isModalOpen  = signal(false);
  readonly isSubmitting = signal(false);
  readonly profile      = signal<CollaboratorProfile | undefined>(undefined);

  contactForm: FormGroup = this.fb.group({
    personalEmail:  ['', [Validators.email]],
    phone:          [''],
    cellPhone:      [''],
    emergencyName:  [''],
    emergencyRel:   [''],
    emergencyPhone: [''],
  });

  constructor() {
    this.loadProfile();

    effect(() => {
      const data = this.profile();
      if (data) {
        this.contactForm.patchValue({
          personalEmail:  data.personalEmail,
          phone:          data.phone,
          cellPhone:      data.cellPhone,
          emergencyName:  data.emergencyName,
          emergencyRel:   data.emergencyRel,
          emergencyPhone: data.emergencyPhone,
        });
      }
    });
  }

  openModal(): void { this.isModalOpen.set(true); }

  closeModal(): void {
    this.isModalOpen.set(false);
    const data = this.profile();
    if (data) this.contactForm.patchValue({
      personalEmail:  data.personalEmail,
      phone:          data.phone,
      cellPhone:      data.cellPhone,
      emergencyName:  data.emergencyName,
      emergencyRel:   data.emergencyRel,
      emergencyPhone: data.emergencyPhone,
    });
  }

  submit(): void {
    if (this.contactForm.invalid) return;
    this.isSubmitting.set(true);

    this.collaboratorService.updateProfile(this.contactForm.value).subscribe({
      next: updated => {
        this.profile.set(updated);
        this.isSubmitting.set(false);
        this.closeModal();
      },
      error: () => this.isSubmitting.set(false),
    });
  }

  private loadProfile(): void {
    this.collaboratorService.getProfile().subscribe({
      next: profile => this.profile.set(profile),
    });
  }
}

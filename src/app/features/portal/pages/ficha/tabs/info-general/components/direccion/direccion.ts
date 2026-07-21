import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppInput, Banner, Button, ChangeRequestBar, Field, LocationCascade, MapWidget, Modal, SectionCard, SplitLayout } from '@shared/ui';
import { CollaboratorService } from '@features/portal/services/collaborator.service';
import { CollaboratorProfile } from '@features/portal/models/collaborator.model';

@Component({
  selector: 'app-direccion',
  imports: [
    ReactiveFormsModule, CommonModule,
    AppInput, Banner, Button, ChangeRequestBar, Field, LocationCascade, MapWidget, Modal, SectionCard, SplitLayout,
  ],
  templateUrl: './direccion.html',
})
export class Direccion {
  private readonly fb                  = inject(FormBuilder);
  private readonly collaboratorService = inject(CollaboratorService);

  readonly isModalOpen  = signal(false);
  readonly isSubmitting = signal(false);
  readonly sameAsDoc    = signal(false);
  readonly isPending    = signal(false);
  readonly submitted    = signal(false);
  readonly profile      = signal<CollaboratorProfile | undefined>(undefined);

  addressForm: FormGroup = this.fb.group({
    address:         ['', Validators.required],
    district:        [''],
    province:        [''],
    departmentdirec: [''],
    addressRef:      [''],
  });

  constructor() {
    this.loadProfile();
    effect(() => {
      const data = this.profile();
      if (!data) return;
      this.addressForm.patchValue({
        address:         data.address         ?? '',
        district:        data.district        ?? '',
        province:        data.province        ?? '',
        departmentdirec: data.departmentdirec ?? '',
        addressRef:      data.addressRef      ?? '',
      });
    });
  }

  openModal(): void { this.isModalOpen.set(true); }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.sameAsDoc.set(false);
    const data = this.profile();
    if (data) {
      this.addressForm.enable();
      this.addressForm.patchValue({
        address:         data.address         ?? '',
        district:        data.district        ?? '',
        province:        data.province        ?? '',
        departmentdirec: data.departmentdirec ?? '',
        addressRef:      data.addressRef      ?? '',
      });
    }
  }

  toggleSameAsDoc(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.sameAsDoc.set(checked);
    const hasDocAddress = !!(this.profile()?.docAddress);
    if (checked && hasDocAddress) {
      const p = this.profile()!;
      this.addressForm.patchValue({
        address:         p.docAddress    ?? '',
        district:        p.docDistrict   ?? '',
        province:        '',
        departmentdirec: p.docDepartment ?? '',
        addressRef:      p.docAddressRef ?? '',
      });
      this.addressForm.disable();
    } else if (!checked) {
      this.addressForm.enable();
      const data = this.profile();
      if (data) {
        this.addressForm.patchValue({
          address:         data.address         ?? '',
          district:        data.district        ?? '',
          province:        data.province        ?? '',
          departmentdirec: data.departmentdirec ?? '',
          addressRef:      data.addressRef      ?? '',
        });
      }
    }
  }

  submitAddressUpdate(): void {
    if (this.addressForm.invalid) return;
    this.isSubmitting.set(true);

    const v        = this.addressForm.getRawValue();
    const current  = this.profile();
    const newData  = {
      address:         v.address         || null,
      district:        v.district        || null,
      province:        v.province        || null,
      departmentdirec: v.departmentdirec || null,
      addressRef:      v.addressRef      || null,
    };
    const previous = {
      address:         current?.address         ?? null,
      district:        current?.district        ?? null,
      province:        current?.province        ?? null,
      departmentdirec: current?.departmentdirec ?? null,
      addressRef:      current?.addressRef      ?? null,
    };

    this.collaboratorService.requestChange('address', newData as any, previous as any).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isPending.set(true);
        this.submitted.set(true);
        this.closeModal();
        setTimeout(() => this.submitted.set(false), 4000);
      },
      error: () => this.isSubmitting.set(false),
    });
  }

  private loadProfile(): void {
    this.collaboratorService.getProfile().subscribe({
      next: profile => {
        this.profile.set(profile);
        this.collaboratorService.hasPendingForSection('address').subscribe(p => this.isPending.set(p));
      },
    });
  }
}

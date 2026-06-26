import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AppInput, AppSelect, Badge, Button, ConfirmModal, EmptyState,
  FormRow, ListItem, LoadingSkeleton, Modal, SectionCard,
} from '@shared/ui';
import { FamiliaService } from '@features/portal/services/familia.service';
import {
  FamilyMember, FamilyMemberPayload, FamilyRelationship, RELATIONSHIP_LABELS,
} from '@features/portal/models/family.model';

@Component({
  selector: 'app-familia',
  imports: [
    CommonModule, ReactiveFormsModule,
    AppInput, AppSelect, Badge, Button, ConfirmModal, EmptyState,
    FormRow, ListItem, LoadingSkeleton, Modal, SectionCard,
  ],
  templateUrl: './familia.html',
  styleUrl: './familia.scss',
})
export class Familia {
  private readonly fb      = inject(FormBuilder);
  private readonly service = inject(FamiliaService);

  readonly members         = signal<FamilyMember[]>([]);
  readonly isLoading       = signal(true);
  readonly isModalOpen     = signal(false);
  readonly isSubmitting    = signal(false);
  readonly isConfirmOpen   = signal(false);
  readonly editingMember   = signal<FamilyMember | undefined>(undefined);
  readonly pendingDeleteId = signal<string | undefined>(undefined);

  readonly padres   = computed(() =>
    this.members().filter(m => (['FATHER','MOTHER','GUARDIAN'] as FamilyRelationship[]).includes(m.relationship)));
  readonly conyugue = computed(() =>
    this.members().filter(m => (['SPOUSE','PARTNER'] as FamilyRelationship[]).includes(m.relationship)));
  readonly hijos    = computed(() =>
    this.members().filter(m => (['SON','DAUGHTER'] as FamilyRelationship[]).includes(m.relationship)));
  readonly otros    = computed(() =>
    this.members().filter(m => (['SIBLING','DEPENDENT','HEIR','OTHER'] as FamilyRelationship[]).includes(m.relationship)));

  readonly relationshipOptions: { value: FamilyRelationship; label: string }[] = [
    { value: 'FATHER',    label: 'Padre'             },
    { value: 'MOTHER',    label: 'Madre'             },
    { value: 'GUARDIAN',  label: 'Tutor / Apoderado' },
    { value: 'SPOUSE',    label: 'Cónyuge'           },
    { value: 'PARTNER',   label: 'Conviviente'       },
    { value: 'SON',       label: 'Hijo'              },
    { value: 'DAUGHTER',  label: 'Hija'              },
    { value: 'SIBLING',   label: 'Hermano/a'         },
    { value: 'DEPENDENT', label: 'Dependiente'       },
    { value: 'HEIR',      label: 'Heredero/a'        },
    { value: 'OTHER',     label: 'Otro'              },
  ];

  readonly docTypeOptions = [
    { value: 'DNI',       label: 'DNI'                     },
    { value: 'PASAPORTE', label: 'Pasaporte'               },
    { value: 'CE',        label: 'Carnet de Extranjería'   },
  ];

  form: FormGroup = this.fb.group({
    firstName:    ['', Validators.required],
    lastName:     ['', Validators.required],
    relationship: ['', Validators.required],
    documentType: ['DNI'],
    documentId:   [''],
    birthDate:    [''],
    phone:        [''],
    isDependent:  [false],
    isHeir:       [false],
  });

  constructor() { this.load(); }

  openAdd(defaultRel?: FamilyRelationship): void {
    this.editingMember.set(undefined);
    this.form.reset({ documentType: 'DNI', isDependent: false, isHeir: false });
    if (defaultRel) this.form.patchValue({ relationship: defaultRel });
    this.isModalOpen.set(true);
  }

  openEdit(member: FamilyMember): void {
    this.editingMember.set(member);
    this.form.patchValue({
      firstName:    member.firstName,
      lastName:     member.lastName,
      relationship: member.relationship,
      documentType: member.documentType,
      documentId:   member.documentId  ?? '',
      birthDate:    member.birthDate   ? member.birthDate.substring(0, 10) : '',
      phone:        member.phone       ?? '',
      isDependent:  member.isDependent,
      isHeir:       member.isHeir,
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingMember.set(undefined);
    this.form.reset({ documentType: 'DNI' });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);

    const payload: FamilyMemberPayload = {
      ...this.form.value,
      documentId: this.form.value.documentId || undefined,
      birthDate:  this.form.value.birthDate  || undefined,
      phone:      this.form.value.phone      || undefined,
    };

    const editing = this.editingMember();
    const obs$    = editing
      ? this.service.update(editing.id, payload)
      : this.service.create(payload);

    obs$.subscribe({
      next: () => { this.load(); this.isSubmitting.set(false); this.closeModal(); },
      error: ()  => this.isSubmitting.set(false),
    });
  }

  requestDelete(id: string): void {
    this.pendingDeleteId.set(id);
    this.isConfirmOpen.set(true);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.isConfirmOpen.set(false);
    this.service.delete(id).subscribe({
      next: () => this.members.update(list => list.filter(m => m.id !== id)),
    });
    this.pendingDeleteId.set(undefined);
  }

  cancelDelete(): void {
    this.isConfirmOpen.set(false);
    this.pendingDeleteId.set(undefined);
  }

  label(rel: FamilyRelationship): string {
    return RELATIONSHIP_LABELS[rel] ?? rel;
  }

  get modalTitle(): string {
    return this.editingMember() ? 'Editar familiar' : 'Agregar familiar';
  }

  private load(): void {
    this.isLoading.set(true);
    this.service.getAll().subscribe({
      next:  members => { this.members.set(members); this.isLoading.set(false); },
      error: ()       => this.isLoading.set(false),
    });
  }
}

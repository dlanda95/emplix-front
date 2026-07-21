import {
  Component, DestroyRef, EventEmitter, Input, OnInit, Output,
  inject, signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { dateRangeValidator } from '@shared/validators/date-range.validator';
import { AppInput }        from '../input/input';
import { AppSelect }       from '../app-select/app-select';
import { Banner }          from '../banner/banner';
import { Button }          from '../button/button';
import { Modal }           from '../modal/modal';
import type { SelectOption } from '../app-select/app-select';
import { CandidatesService, CreateCandidateResult } from '@features/admin/services/candidates.service';
import { DOCUMENT_TYPE_OPTIONS } from '@features/portal/models/catalog.model';

// ── Constantes de validación por tipo de documento (Perú) ─────────────────────
export const DOCUMENT_FORMAT_RULES: Record<string, { pattern: RegExp; hint: string; message: string }> = {
  DNI:       { pattern: /^\d{8}$/,             hint: '8 dígitos numéricos exactos',      message: 'El DNI debe contener exactamente 8 dígitos numéricos.'          },
  CE:        { pattern: /^[A-Za-z0-9]{5,15}$/, hint: '5 a 15 caracteres alfanuméricos',  message: 'El CE debe tener entre 5 y 15 caracteres alfanuméricos.'          },
  PASAPORTE: { pattern: /^[A-Za-z0-9]{6,20}$/, hint: '6 a 20 caracteres alfanuméricos',  message: 'El Pasaporte debe tener entre 6 y 20 caracteres alfanuméricos.'   },
  PTP:       { pattern: /^[A-Za-z0-9]{5,15}$/, hint: '5 a 15 caracteres alfanuméricos',  message: 'El PTP debe tener entre 5 y 15 caracteres alfanuméricos.'         },
};

// Restricciones de input por tipo de documento
const DOCUMENT_INPUT_RULES: Record<string, { maxLength: number; numericOnly: boolean }> = {
  DNI:       { maxLength: 8,  numericOnly: true  },
  CE:        { maxLength: 15, numericOnly: false  },
  PASAPORTE: { maxLength: 20, numericOnly: false  },
  PTP:       { maxLength: 15, numericOnly: false  },
};

function documentIdValidator(documentType: string): ValidatorFn {
  return (control: AbstractControl) => {
    const value = (control.value ?? '').toString().trim();
    if (!value) return null;
    const rule = DOCUMENT_FORMAT_RULES[documentType];
    if (!rule) return null;
    return rule.pattern.test(value) ? null : { docFormat: { message: rule.message } };
  };
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);

@Component({
  selector: 'app-create-candidate-modal',
  imports: [CommonModule, ReactiveFormsModule, AppInput, AppSelect, Banner, Button, Modal],
  templateUrl: './create-candidate-modal.html',
})
export class CreateCandidateModal implements OnInit {
  /** ID del proceso de selección al que pertenecerá el candidato (opcional). */
  @Input() selectionProcessId: string | null = null;

  /** Emite el resultado completo cuando el candidato es registrado exitosamente. */
  @Output() candidateRegistered = new EventEmitter<CreateCandidateResult>();

  private readonly svc        = inject(CandidatesService);
  private readonly fb         = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly isOpen      = signal(false);
  readonly isCreating  = signal(false);
  readonly createError = signal('');

  readonly credentialData       = signal<CreateCandidateResult | null>(null);
  readonly showCredentialsModal = signal(false);
  readonly copiedField          = signal<'user' | 'pass' | null>(null);

  readonly documentTypes   = DOCUMENT_TYPE_OPTIONS;
  readonly docMaxLength    = signal(8);
  readonly docNumericOnly  = signal(true);

  form = this.fb.group({
    firstName:     ['', Validators.required],
    lastName:      ['', Validators.required],
    middleName:    [''],
    documentType:  ['DNI', Validators.required],
    documentId:    ['', [Validators.required, documentIdValidator('DNI')]],
    personalEmail: ['', [Validators.required, Validators.email]],
    hireDate:      [TODAY_ISO, [Validators.required, dateRangeValidator]],
  });

  get documentHint(): string {
    return DOCUMENT_FORMAT_RULES[this.form.get('documentType')?.value ?? 'DNI']?.hint ?? '';
  }

  ngOnInit(): void {
    this.form.get('documentType')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(documentType => {
        const type = documentType ?? 'DNI';
        this.updateDocumentIdValidators(type);
        const rules = DOCUMENT_INPUT_RULES[type];
        this.docMaxLength.set(rules?.maxLength ?? 20);
        this.docNumericOnly.set(rules?.numericOnly ?? false);
        this.form.get('documentId')!.setValue('', { emitEvent: false });
      });
  }

  open(): void {
    this.form.reset({ firstName: '', lastName: '', middleName: '', documentType: 'DNI', documentId: '', personalEmail: '', hireDate: TODAY_ISO });
    this.updateDocumentIdValidators('DNI');
    this.createError.set('');
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.createError.set('');
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isCreating.set(true);
    this.createError.set('');

    // Zod rechaza null — filtramos campos vacíos/nulos opcionales antes de enviar
    const raw = this.form.value as Record<string, unknown>;
    const payload: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(raw)) {
      if (val !== null && val !== undefined) payload[key] = val;
    }
    if (this.selectionProcessId) payload['selectionProcessId'] = this.selectionProcessId;

    this.svc.create(payload as any).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        this.isCreating.set(false);
        this.close();
        this.credentialData.set(result);
        this.showCredentialsModal.set(true);
        this.candidateRegistered.emit(result);
      },
      error: err => {
        this.isCreating.set(false);
        const firstFieldErr = err?.error?.errors?.[0];
        const detail = firstFieldErr ? ` — ${firstFieldErr.message}` : '';
        this.createError.set((err?.error?.message ?? 'Error al registrar el candidato.') + detail);
      },
    });
  }

  closeCredentials(): void {
    this.showCredentialsModal.set(false);
    this.credentialData.set(null);
    this.copiedField.set(null);
  }

  async copyToClipboard(field: 'user' | 'pass'): Promise<void> {
    const data = this.credentialData();
    if (!data) return;
    const text = field === 'user'
      ? (data.employee as any).documentId
      : data.temporaryPassword;
    try {
      await navigator.clipboard.writeText(text);
      this.copiedField.set(field);
      setTimeout(() => this.copiedField.set(null), 2000);
    } catch { /* clipboard no disponible */ }
  }

  private updateDocumentIdValidators(documentType: string): void {
    const control = this.form.get('documentId')!;
    control.setValidators([Validators.required, documentIdValidator(documentType)]);
    control.updateValueAndValidity();
  }
}

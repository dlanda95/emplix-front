import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Banner, Button, Field, SectionCard, Modal } from '@shared/ui';
import { OnboardingService } from '../../services/onboarding.service';
import { AuthService } from '@core/auth/auth';
import { DOCUMENT_TYPE_OPTIONS, catalogLabel } from '@features/portal/models/catalog.model';

@Component({
  selector: 'app-paso-revision',
  imports: [CommonModule, Banner, Button, Field, SectionCard, Modal],
  templateUrl: './paso-revision.html',
})
export class PasoRevision {
  readonly svc          = inject(OnboardingService);
  private readonly auth = inject(AuthService);
  private readonly nav  = inject(Router);

  readonly isSubmitting    = signal(false);
  readonly submitted       = signal(false);
  readonly error           = signal('');
  readonly showConfirm     = signal(false);

  docTypeLabel(val: string | null | undefined): string {
    return catalogLabel(DOCUMENT_TYPE_OPTIONS, val);
  }

  openConfirm(): void  { this.showConfirm.set(true);  }
  closeConfirm(): void { this.showConfirm.set(false); }

  submit(): void {
    this.showConfirm.set(false);
    this.isSubmitting.set(true);
    this.error.set('');
    this.svc.submit().subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submitted.set(true);
        // Actualizar el signal de auth → el shell computed() reacciona de inmediato
        this.auth.patchCurrentUser({ onboardingStatus: 'DOCS_SUBMITTED' });
        // Navegar al shell root para limpiar la URL (el shell ya muestra submitted state)
        this.nav.navigate(['/onboarding']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(err?.error?.message ?? 'Error al enviar. Intenta nuevamente.');
      },
    });
  }
}

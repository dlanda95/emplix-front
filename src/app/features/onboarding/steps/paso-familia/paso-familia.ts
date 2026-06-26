import { Component, inject } from '@angular/core';
import { Banner, SectionCard } from '@shared/ui';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'app-paso-familia',
  imports: [Banner, SectionCard],
  template: `
    <app-section-card title="Entorno Familiar" [columns]="1">
      <app-banner variant="info" icon="people" title="Sección en construcción">
        <p>Podrás agregar a tus derechohabientes (cónyuge, hijos) y contactos de emergencia desde tu perfil una vez activada tu cuenta.</p>
      </app-banner>
    </app-section-card>
  `,
  styles: [],
})
export class PasoFamilia {
  constructor() {
    inject(OnboardingService).markSaved('familia');
  }
}

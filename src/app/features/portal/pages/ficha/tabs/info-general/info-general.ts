import { Component, inject, signal, computed } from '@angular/core';
import { TabsCard, TabItem } from '../../../../../../shared/components/ui/tabs-card/tabs-card';
import { MisDatos }    from './components/mis-datos/mis-datos';
import { Direccion }   from './components/direccion/direccion';
import { Familia }     from './components/familia/familia';
import { Contacto }    from './components/contacto/contacto';
import { Financiero }  from './components/financiero/financiero';
import { Estudios }    from './components/estudios/estudios';
import { CollaboratorService } from '@features/portal/services/collaborator.service';
import { HIGHER_EDUCATION_LEVELS } from '@features/portal/models/catalog.model';

@Component({
  selector: 'app-info-general',
  imports: [TabsCard, MisDatos, Direccion, Familia, Contacto, Financiero, Estudios],
  templateUrl: './info-general.html',
  styleUrl: './info-general.scss',
})
export class InfoGeneral {
  private readonly collaboratorService = inject(CollaboratorService);

  readonly activeTab     = signal('mis-datos');
  readonly academicLevel = signal<string | null | undefined>(undefined);

  readonly showEstudios = computed(() => {
    const level = this.academicLevel();
    return level != null && HIGHER_EDUCATION_LEVELS.has(level);
  });

  readonly tabItems = computed<TabItem[]>(() => {
    const items: TabItem[] = [
      { id: 'mis-datos',   label: 'Mis Datos',   icon: 'person'          },
      { id: 'direccion',   label: 'Dirección',   icon: 'location_on'     },
      { id: 'contacto',    label: 'Contacto',    icon: 'contact_phone'   },
      { id: 'financiero',  label: 'Financiero',  icon: 'account_balance' },
      { id: 'familia',     label: 'Familia',     icon: 'family_restroom' },
    ];
    if (this.showEstudios()) {
      items.push({ id: 'estudios', label: 'Estudios', icon: 'school' });
    }
    return items;
  });

  constructor() {
    this.collaboratorService.getProfile().subscribe({
      next: profile => {
        this.academicLevel.set(profile.academicLevel);
        if (!HIGHER_EDUCATION_LEVELS.has(profile.academicLevel ?? '') && this.activeTab() === 'estudios') {
          this.activeTab.set('mis-datos');
        }
      },
    });
  }
}

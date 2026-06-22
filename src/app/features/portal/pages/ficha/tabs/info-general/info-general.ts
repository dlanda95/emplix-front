import { Component } from '@angular/core';
import { TabsCard, TabItem } from '../../../../../../shared/components/ui/tabs-card/tabs-card';
import { MisDatos } from './components/mis-datos/mis-datos';
import { Direccion } from './components/direccion/direccion';

@Component({
  selector: 'app-info-general',
  imports: [TabsCard, MisDatos, Direccion],
  templateUrl: './info-general.html',
  styleUrl: './info-general.scss',
})
export class InfoGeneral {
  activeTab = 'mis-datos';

  tabItems: TabItem[] = [
    { id: 'mis-datos', label: 'Mis Datos' },
    { id: 'direccion', label: 'Dirección' },
    { id: 'contacto', label: 'Contacto' },
    { id: 'familia', label: 'Familia' }
  ];
}

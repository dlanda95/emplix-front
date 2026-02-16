import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SectionCard } from '../../../../../../shared/components/ui/section-card/section-card';
import { TabsCard,TabItem } from '../../../../../../shared/components/ui/tabs-card/tabs-card';
import { Field } from '../../../../../../shared/components/ui/field/field';




// Importamos los Legos Hijos
import { MisDatos } from './components/mis-datos/mis-datos';
import { Direccion } from './components/direccion/direccion';



@Component({
  selector: 'app-info-general',
  imports: [CommonModule, SectionCard, TabsCard, Field, MisDatos,Direccion],
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

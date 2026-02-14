import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Section } from '../../../../../../shared/components/ui/section/section';
import { Tabs,TabItem } from '../../../../../../shared/components/ui/tabs/tabs';
import { Field } from '../../../../../../shared/components/ui/field/field';

@Component({
  selector: 'app-info-general',
  imports: [CommonModule, Section, Tabs, Field],
  templateUrl: './info-general.html',
  styleUrl: './info-general.scss',
})
export class InfoGeneral {
activeTab = 'mis-datos';

  tabItems: TabItem[] = [
    { id: 'mis-datos', label: 'Mis Datos', icon: 'face' },
    { id: 'direccion', label: 'Dirección' },
    { id: 'contacto', label: 'Contacto' },
    { id: 'familia', label: 'Familia' }
  ];



}

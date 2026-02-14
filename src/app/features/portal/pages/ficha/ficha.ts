import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// Importamos los Legos
import {  CardHeaderConfig } from '../../../../shared/components/ui/app-card/app-card';
import {  SidebarLayoutItem } from '../../../../shared/components/layout/sidebar-layout/sidebar-layout';
import { AppCard } from '../../../../shared/components/ui/app-card/app-card';
import { SidebarLayout } from '../../../../shared/components/layout/sidebar-layout/sidebar-layout';
@Component({
  selector: 'app-ficha',
imports: [RouterOutlet, AppCard, SidebarLayout],
  templateUrl: './ficha.html',
  styleUrl: './ficha.scss',
})
export class Ficha {// DATA PURA: El HTML no tiene nada hardcodeado
  
  headerData: CardHeaderConfig = {
    title: 'Legajo: E-2024-99',
    subtitle: 'PORTAL DEL COLABORADOR',
    version: 'Versión 2.0',
    icon: 'folder_shared',
    variant: 'primary' // Podrías cambiar a 'info' si quieres azul
  };

  menuData: SidebarLayoutItem[] = [
    { label: 'Información General', icon: 'person', route: 'general', exact: true },
    { label: 'Histórico Laboral', icon: 'history', route: 'historico' },
    { label: 'Documentos', icon: 'description', route: 'documentos' },
    { label: 'Vacaciones', icon: 'beach_access', route: 'vacaciones' }
  ];
}
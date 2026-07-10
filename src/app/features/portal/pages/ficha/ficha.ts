import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppCard, type CardHeaderConfig } from '@shared/ui';
import { SidebarLayout, type SidebarLayoutItem } from '@shared/layout';

@Component({
  selector: 'app-ficha',
  imports: [RouterOutlet, AppCard, SidebarLayout],
  templateUrl: './ficha.html',
})
export class Ficha {
  readonly headerData: CardHeaderConfig = {
    title:    'Legajo: E-2024-99',
    subtitle: 'PORTAL DEL COLABORADOR',
    version:  'Versión 2.0',
    icon:     'folder_shared',
    variant:  'primary',
  };

  readonly menuData: SidebarLayoutItem[] = [
    { label: 'Información General', icon: 'person',       route: 'general',    exact: true },
    { label: 'Histórico Laboral',   icon: 'history',      route: 'historico'               },
    { label: 'Documentos',          icon: 'description',  route: 'documentos'              },
    { label: 'Vacaciones',          icon: 'beach_access', route: 'vacaciones'              },
  ];
}

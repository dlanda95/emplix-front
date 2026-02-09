import { Component,inject } from '@angular/core';

import { LayoutService } from '../services/layout';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  // Inyectamos el servicio
  layoutService = inject(LayoutService);

  onToggleMenu() {
    this.layoutService.toggleSidebar();
  }

}

import { Component, inject } from '@angular/core';
import { LayoutService } from '../services/layout';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  readonly layoutService = inject(LayoutService);

  onToggleMenu(): void {
    if (window.innerWidth < 1024) {
      this.layoutService.toggleMobileMenu();
    } else {
      this.layoutService.toggleSidebar();
    }
  }
}

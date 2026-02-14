import { Component,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../services/layout';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
 layoutService = inject(LayoutService);

  onToggleMenu() {
    // 🔥 LÓGICA INTELIGENTE
    // Si la pantalla es menor a 1024px (nuestro breakpoint de Laptop/Tablet)
    if (window.innerWidth < 1024) {
      // Estamos en MÓVIL: Abrimos el menú lateral (Overlay)
      this.layoutService.toggleMobileMenu();
    } else {
      // Estamos en DESKTOP: Colapsamos/Expandimos el menú (Mini)
      this.layoutService.toggleSidebar();
    }
  }
}

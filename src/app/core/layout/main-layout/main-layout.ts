import { Component,inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar'; // 🔥 Importar
import { Topbar } from '../topbar/topbar';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../services/layout';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, CommonModule,Sidebar,Topbar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
private layoutService = inject(LayoutService);
  
  // 1. Signal para Desktop (Mini vs Full)
  desktopCollapsed = this.layoutService.isSidebarCollapsed;

  // 2. Signal para Móvil (Oculto vs Visible)
  mobileOpen = this.layoutService.mobileMenuOpen;

  closeMobileSidebar() {
    this.layoutService.closeMobileMenu();
  }
}

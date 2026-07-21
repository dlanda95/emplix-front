import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { LayoutService } from '../services/layout';
import { SessionService } from '@core/auth/session.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, CommonModule, Sidebar, Topbar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private readonly layoutService = inject(LayoutService);
  readonly session               = inject(SessionService);

  desktopCollapsed = this.layoutService.isSidebarCollapsed;
  mobileOpen       = this.layoutService.mobileMenuOpen;

  constructor() {
    this.session.init();
  }

  closeMobileSidebar(): void {
    this.layoutService.closeMobileMenu();
  }
}

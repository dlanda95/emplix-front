import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { LayoutService } from '../services/layout';
import { LogoutBtn } from '@shared/ui';

export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, LogoutBtn, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  private readonly layoutService = inject(LayoutService);
  private readonly router        = inject(Router);

  readonly collapsed = this.layoutService.isSidebarCollapsed;

  menuItems = signal<MenuItem[]>([
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    {
      label: 'Portal', icon: 'account_circle', expanded: false,
      children: [
        { label: 'Mi Ficha',         icon: 'badge',        route: '/portal/ficha' },
        { label: 'Reconocimientos',  icon: 'military_tech', route: '/portal/reconocimientos' },
        { label: 'Mi Equipo',        icon: 'groups',        route: '/portal/equipo' },
      ]
    },
    { label: 'Usuarios',      icon: 'group',    route: '/users' },
    { label: 'Configuración', icon: 'settings', route: '/settings' },
  ]);

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  toggleSubmenu(item: MenuItem): void {
    if (!item.children) return;
    if (this.collapsed()) this.layoutService.expandSidebar();
    item.expanded = !item.expanded;
  }

  isActive(item: MenuItem): boolean {
    if (item.route && this.router.url.includes(item.route)) return true;
    return item.children?.some(c => c.route && this.router.url.includes(c.route)) ?? false;
  }

  private checkScreenSize(): void {
    if (window.innerWidth < 1024) {
      this.layoutService.expandSidebar();
    }
  }
}

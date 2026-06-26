import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { LayoutService } from '../services/layout';
import { LogoutBtn } from '@shared/ui';
import { AuthService } from '@core/auth/auth';
import { isHR } from '@core/auth/models/user.model';

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
  private readonly auth          = inject(AuthService);

  readonly collapsed   = this.layoutService.isSidebarCollapsed;
  readonly expandedSet = signal<Set<string>>(new Set());

  readonly menuItems = computed<MenuItem[]>(() => {
    const expanded      = this.expandedSet();
    const user          = this.auth.currentUser();
    const hrUser        = isHR(user?.role);
    const isCandidate   = user?.employeeStatus === 'SELECTED';

    // Candidato en proceso de onboarding → menú simplificado
    if (isCandidate) {
      return [
        { label: 'Mi Incorporación', icon: 'assignment_ind', route: '/onboarding/identidad' },
        { label: 'Configuración',    icon: 'settings',       route: '/settings'             },
      ];
    }

    const hrSection: MenuItem[] = hrUser ? [
      {
        label: 'RRHH', icon: 'corporate_fare', expanded: expanded.has('RRHH'),
        children: [
          { label: 'Candidatos',    icon: 'group_add', route: '/admin/candidatos'    },
          { label: 'Colaboradores', icon: 'badge',     route: '/admin/colaboradores' },
          { label: 'Solicitudes',   icon: 'approval',  route: '/admin/solicitudes'   },
        ],
      },
    ] : [];

    // Portal disponible para todos los empleados activos, incluyendo personal RRHH
    const portalSection: MenuItem[] = [
      {
        label: 'Mi Portal', icon: 'account_circle', expanded: expanded.has('Mi Portal'),
        children: [
          { label: 'Mi Ficha',        icon: 'badge',         route: '/portal/ficha'           },
          { label: 'Reconocimientos', icon: 'military_tech', route: '/portal/reconocimientos' },
          { label: 'Mi Equipo',       icon: 'groups',        route: '/portal/equipo'          },
        ],
      },
    ];

    return [
      { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
      ...hrSection,
      ...portalSection,
      { label: 'Configuración', icon: 'settings', route: '/settings' },
    ];
  });

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
    this.expandedSet.update(set => {
      const next = new Set(set);
      next.has(item.label) ? next.delete(item.label) : next.add(item.label);
      return next;
    });
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

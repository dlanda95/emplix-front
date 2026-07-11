import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { LayoutService } from '../services/layout';
import { LogoutBtn } from '@shared/ui';
import { AuthService } from '@core/auth/auth';
import { isHR } from '@core/auth/models/user.model';

export interface MenuItem {
  label:    string;
  icon?:    string;
  route?:   string;
  children?: MenuItem[];
  expanded?: boolean;
  /** Renderiza como cabecera de sección (no clickeable) */
  type?: 'section';
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
    const expanded    = this.expandedSet();
    const user        = this.auth.currentUser();
    const hrUser      = isHR(user?.role);
    const isSystemUser = !!user?.isSystemUser;
    const isCandidate  = user?.employeeStatus === 'SELECTED';

    // Candidato en proceso de onboarding → menú simplificado
    if (isCandidate) {
      return [{ label: 'Mi Incorporación', icon: 'assignment_ind', route: '/onboarding/identidad' }];
    }

    const items: MenuItem[] = [
      { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    ];

    // ── Sección RRHH ────────────────────────────────────────────────────────
    if (hrUser || isSystemUser) {
      items.push({ label: 'RRHH', type: 'section' });
      items.push({
        label: 'RRHH', icon: 'corporate_fare', expanded: expanded.has('RRHH'),
        children: [
          { label: 'Procesos de Selección', icon: 'work_history', route: '/admin/procesos-seleccion' },
          { label: 'Candidatos',            icon: 'group_add',    route: '/admin/candidatos'         },
          { label: 'Colaboradores',         icon: 'badge',        route: '/admin/colaboradores'      },
          { label: 'Solicitudes',           icon: 'approval',     route: '/admin/solicitudes'        },
          { label: 'Organización',          icon: 'account_tree', route: '/admin/organizacion'       },
        ],
      });

      // ── Sección Configuración ──────────────────────────────────────────────
      items.push({ label: 'Configuración', type: 'section' });
      const configChildren: MenuItem[] = [
        { label: 'Usuarios',        icon: 'manage_accounts', route: '/admin/usuarios'                     },
        { label: 'Tipos de acceso', icon: 'tune',            route: '/admin/configuracion/tipos-usuario'  },
        { label: 'Dominios',        icon: 'domain',          route: '/admin/configuracion/dominios'       },
      ];
      if (user?.role === 'COMPANY_ADMIN') {
        configChildren.push({ label: 'Métodos de acceso', icon: 'security', route: '/admin/configuracion/metodos-acceso' });
      }
      items.push({
        label: 'Configuración', icon: 'admin_panel_settings', expanded: expanded.has('Configuración'),
        children: configChildren,
      });
    }

    // ── Sección Portal (solo empleados con ficha) ────────────────────────────
    if (!isSystemUser) {
      items.push({ label: 'Mi espacio', type: 'section' });
      items.push({
        label: 'Mi Portal', icon: 'account_circle', expanded: expanded.has('Mi Portal'),
        children: [
          { label: 'Mi Ficha',        icon: 'badge',         route: '/portal/ficha'           },
          { label: 'Reconocimientos', icon: 'military_tech', route: '/portal/reconocimientos' },
          { label: 'Mi Equipo',       icon: 'groups',        route: '/portal/equipo'          },
        ],
      });
    }

    return items;
  });

  ngOnInit(): void { this.checkScreenSize(); }

  @HostListener('window:resize')
  onResize(): void { this.checkScreenSize(); }

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
    if (window.innerWidth < 1024) this.layoutService.expandSidebar();
  }
}

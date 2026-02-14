import { Component,Input,signal,HostListener,computed,inject,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive,Router } from '@angular/router';
import { LogoutBtn } from '../../../shared/components/ui/logout-btn/logout-btn';

import { LayoutService } from '../services/layout';
import { ImplicitReceiver } from '@angular/compiler';
// 1. Definimos la interfaz para items con hijos
export interface MenuItem {
  label: string;
  icon: string;
  route?: string; // Opcional si tiene hijos
  children?: MenuItem[];
  expanded?: boolean; // Estado visual (abierto/cerrado)
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, LogoutBtn,RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit{
private layoutService = inject(LayoutService);
  private router = inject(Router);

  // Estado del sidebar (colapsado/expandido)
  collapsed = this.layoutService.isSidebarCollapsed;


  // Definimos el menú aquí para no ensuciar el HTML
menuItems = signal<MenuItem[]>([
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    
    // 🔥 PORTAL CON SUBMENÚS
    { 
      label: 'Portal', 
      icon: 'account_circle',
      // No tiene route directa, expande hijos
      expanded: false, 
      children: [
        { label: 'Mi Ficha', icon: 'badge', route: '/portal/ficha' },
        { label: 'Reconocimientos', icon: 'military_tech', route: '/portal/reconocimientos' },
        { label: 'Mi Equipo', icon: 'groups', route: '/portal/equipo' }
      ]
    },

    { label: 'Usuarios', icon: 'group', route: '/users' },
    { label: 'Configuración', icon: 'settings', route: '/settings' }
  ]);


ngOnInit() {
    this.checkScreenSize();
  }
  // 🔥 LÓGICA RESPONSIVA EN TS (No en CSS)
  // Si cambias el tamaño de la ventana, Angular decide si colapsar.
  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const width = window.innerWidth;
    // Si es menor a 1024px (Laptop), colapsamos automáticamente
    if (width < 1024) {
      // MÓVIL/TABLET: 
      // El MainLayout se encarga de ocultarlo/mostrarlo.
      // Nosotros forzamos "expandSidebar" para que cuando aparezca, ¡se vea COMPLETO con texto!
      this.layoutService.expandSidebar(); 
    } 
    else if (width < 1280) {
      // LAPTOP PEQUEÑA (Opcional):
      // Aquí sí podemos activar el modo "Mini" automáticamente para dar espacio.
      // this.layoutService.collapseSidebar(); // Descomenta si te gusta el efecto
    }
    else {
      // PANTALLA GRANDE:
      // Lo dejamos como el usuario lo haya dejado (no forzamos nada)
    }
  }

  toggleSubmenu(item: MenuItem) {
    if (!item.children) return;
    
    // Si está colapsado y tocas un menú, lo abrimos para que veas las opciones
    if (this.collapsed()) {
      this.layoutService.expandSidebar();
    }
    
    // Toggle simple
    item.expanded = !item.expanded;
  }

  isActive(item: MenuItem): boolean {
    if (item.route && this.router.url.includes(item.route)) return true;
    if (item.children) {
      return item.children.some(child => child.route && this.router.url.includes(child.route));
    }
    return false;
  }

}

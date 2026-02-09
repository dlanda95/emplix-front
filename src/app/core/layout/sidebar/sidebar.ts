import { Component,Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LogoutBtn } from '../../../shared/components/ui/logout-btn/logout-btn';
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, LogoutBtn,RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
@Input() isCollapsed = false;

  // Definimos el menú aquí para no ensuciar el HTML
  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Usuarios', icon: 'group', route: '/users' }, // Rutas dummy por ahora
    { label: 'Reportes', icon: 'bar_chart', route: '/reports' },
    { label: 'Configuración', icon: 'settings', route: '/settings' },
  ];

  // Versión de la app (Estilo profesional)
  appVersion = 'v2.0.0';

}

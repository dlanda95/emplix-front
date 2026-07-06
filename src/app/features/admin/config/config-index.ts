import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PageHeader } from '@shared/ui';
import { PermissionsService } from '@core/auth/permissions.service';

interface ConfigCard {
  title:       string;
  description: string;
  icon:        string;
  route:       string;
  color:       string;
  tags:        string[];
  adminOnly:   boolean;
}

@Component({
  selector: 'app-config-index',
  imports: [CommonModule, PageHeader],
  templateUrl: './config-index.html',
  styleUrl:    './config-index.scss',
})
export class ConfigIndex {
  private readonly router = inject(Router);
  readonly perms          = inject(PermissionsService);

  readonly cards: ConfigCard[] = [
    {
      title:       'Usuarios del sistema',
      description: 'Gestiona cuentas de soporte, auditoría y administración. Controla quién tiene acceso al panel y qué puede hacer.',
      icon:        'manage_accounts',
      route:       '/admin/usuarios',
      color:       '#6366f1',
      tags:        ['Crear usuarios', 'Tipos de acceso', 'Activar / Desactivar'],
      adminOnly:   false,
    },
    {
      title:       'Tipos de acceso',
      description: 'Define perfiles de permisos reutilizables: qué puede leer, crear, editar o aprobar cada tipo de usuario del sistema.',
      icon:        'tune',
      route:       '/admin/configuracion/tipos-usuario',
      color:       '#f59e0b',
      tags:        ['Lectura', 'Escritura', 'Aprobación', 'Config'],
      adminOnly:   true,
    },
    {
      title:       'Dominios corporativos',
      description: 'Registra los dominios de correo de tu organización. Los usuarios solo escribirán su nombre de usuario al iniciar sesión.',
      icon:        'domain',
      route:       '/admin/configuracion/dominios',
      color:       '#10b981',
      tags:        ['Login simplificado', 'Multi-dominio', 'Dominio principal'],
      adminOnly:   true,
    },
  ];

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}

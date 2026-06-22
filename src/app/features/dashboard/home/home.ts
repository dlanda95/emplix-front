import { Component, inject } from '@angular/core';
import { AuthService } from '@core/auth/auth';
import { StatCard, PrimaryBtn, Avatar } from '@shared/ui';

interface Stat {
  label:   string;
  value:   string;
  icon:    string;
  variant: 'primary' | 'success' | 'warning' | 'info';
}

interface ActivityItem {
  user:   string;
  action: string;
  time:   string;
}

@Component({
  selector: 'app-home',
  imports: [StatCard, PrimaryBtn, Avatar],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly authService = inject(AuthService);
  readonly currentUser = this.authService.currentUser;

  readonly stats: Stat[] = [
    { label: 'Empleados Activos',      value: '124', icon: 'groups',              variant: 'primary' },
    { label: 'Asistencia Hoy',         value: '92%', icon: 'fact_check',           variant: 'success' },
    { label: 'Solicitudes Pendientes', value: '5',   icon: 'notifications_active', variant: 'warning' },
    { label: 'Nuevas Contrataciones',  value: '3',   icon: 'person_add',           variant: 'info'    },
  ];

  readonly activities: ActivityItem[] = [
    { user: 'Ana García',  action: 'registró su entrada',    time: '08:02 AM' },
    { user: 'Carlos Ruiz', action: 'solicitó vacaciones',    time: '08:15 AM' },
    { user: 'Sistema',     action: 'generó reporte mensual', time: '09:00 AM' },
  ];
}

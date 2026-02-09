import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth';

import { StatCard } from '../../../shared/components/ui/stat-card/stat-card';
import { PrimaryBtn } from '../../../shared/components/ui/primary-btn/primary-btn';




interface Stat {
  label: string;
  value: string;
  icon: string;
  variant: 'primary' | 'success' | 'warning' | 'info';
}

@Component({
  selector: 'app-home',
  imports: [CommonModule,StatCard,PrimaryBtn],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})





export class Home {
  

  authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  // Datos Mockeados (Pronto conectaremos con Backend)
  stats: Stat[] = [
    { label: 'Empleados Activos', value: '124', icon: 'groups', variant: 'primary' },
    { label: 'Asistencia Hoy', value: '92%', icon: 'fact_check', variant: 'success' },
    { label: 'Solicitudes Pendientes', value: '5', icon: 'notifications_active', variant: 'warning' },
    { label: 'Nuevas Contrataciones', value: '3', icon: 'person_add', variant: 'info' }
  ];

  activities = [
    { user: 'Ana García', action: 'registró su entrada', time: '08:02 AM', icon: 'login' },
    { user: 'Carlos Ruiz', action: 'solicitó vacaciones', time: '08:15 AM', icon: 'flight' },
    { user: 'Sistema', action: 'generó reporte mensual', time: '09:00 AM', icon: 'description' },
  ];

}

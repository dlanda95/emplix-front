import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '@core/auth/auth';
import { StatCard, Avatar, LoadingSkeleton, Banner } from '@shared/ui';
import { DashboardService, DashboardStats, RecentRequest } from '../dashboard.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, StatCard, Avatar, LoadingSkeleton, Banner],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly auth       = inject(AuthService);
  private readonly svc        = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentUser = this.auth.currentUser;
  readonly isLoading   = signal(true);
  readonly loadError   = signal('');
  readonly stats       = signal<DashboardStats | null>(null);
  readonly recent      = signal<RecentRequest[]>([]);

  readonly statCards = computed(() => {
    const s = this.stats();
    return [
      { label: 'Empleados Activos',       value: s ? s.totalEmployees.toString()    : '—', icon: 'groups',               variant: 'primary'  as const },
      { label: 'Solicitudes Pendientes',  value: s ? s.pendingRequests.toString()   : '—', icon: 'notifications_active',  variant: 'warning'  as const },
      { label: 'Ingresos este mes',       value: s ? s.newHiresThisMonth.toString() : '—', icon: 'person_add',            variant: 'info'     as const },
      { label: 'Candidatos en proceso',   value: s ? s.pendingCandidates.toString() : '—', icon: 'how_to_reg',            variant: 'success'  as const },
    ];
  });

  ngOnInit(): void {
    forkJoin({
      stats:  this.svc.getStats(),
      recent: this.svc.getRecentRequests(),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ stats, recent }) => {
        this.stats.set(stats);
        this.recent.set(recent);
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('No se pudieron cargar las estadísticas.');
        this.isLoading.set(false);
      },
    });
  }

  typeLabel(type: string): string {
    return this.svc.typeLabel(type);
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins < 1)   return 'ahora mismo';
    if (mins < 60)  return `hace ${mins} min`;
    if (hours < 24) return `hace ${hours} h`;
    return `hace ${days} d`;
  }
}

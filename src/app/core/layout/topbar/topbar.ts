import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LayoutService } from '../services/layout';
import { AuthService }   from '@core/auth/auth';

const ROUTE_TITLES: { prefix: string; label: string }[] = [
  { prefix: '/onboarding', label: 'Mi Incorporación' },
  { prefix: '/admin/candidatos', label: 'Candidatos' },
  { prefix: '/admin/colaboradores', label: 'Colaboradores' },
  { prefix: '/admin', label: 'RRHH' },
  { prefix: '/portal/ficha', label: 'Mi Ficha' },
  { prefix: '/portal/reconocimientos', label: 'Reconocimientos' },
  { prefix: '/portal/equipo', label: 'Mi Equipo' },
  { prefix: '/portal', label: 'Portal' },
  { prefix: '/settings', label: 'Configuración' },
  { prefix: '/dashboard', label: 'Dashboard' },
];

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar implements OnInit, OnDestroy {
  readonly layoutService = inject(LayoutService);
  readonly auth          = inject(AuthService);
  private readonly router = inject(Router);

  readonly pageTitle = signal('Dashboard');
  private sub?: Subscription;

  readonly userInitials = computed(() => {
    const u = this.auth.currentUser();
    if (!u) return 'U';
    return ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase() || 'U';
  });

  ngOnInit(): void {
    this.updateTitle(this.router.url);
    this.sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.updateTitle(e.urlAfterRedirects ?? e.url));
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  onToggleMenu(): void {
    if (window.innerWidth < 1024) {
      this.layoutService.toggleMobileMenu();
    } else {
      this.layoutService.toggleSidebar();
    }
  }

  private updateTitle(url: string): void {
    const match = ROUTE_TITLES.find(r => url.startsWith(r.prefix));
    this.pageTitle.set(match?.label ?? 'Emplix');
  }
}

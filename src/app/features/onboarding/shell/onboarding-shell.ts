import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { OnboardingService } from '../services/onboarding.service';
import { AuthService } from '@core/auth/auth';
import { Banner, Button, LoadingSkeleton, OnboardingLayout } from '@shared/ui';

export interface OnboardingStep {
  path:        string;
  label:       string;
  icon:        string;
  pendingHint: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { path: 'identidad',  label: 'Identidad',   icon: 'badge',           pendingHint: 'Guarda el avance para continuar'                   },
  { path: 'residencia', label: 'Residencia',   icon: 'home',            pendingHint: 'Guarda el avance para continuar'                   },
  { path: 'contacto',   label: 'Contacto',     icon: 'phone',           pendingHint: 'Guarda el avance para continuar'                   },
  { path: 'financiero', label: 'Financiero',   icon: 'account_balance', pendingHint: 'Guarda el avance para continuar'                   },
  { path: 'familia',    label: 'Familia',      icon: 'people',          pendingHint: ''                                                   },
  { path: 'documentos', label: 'Documentos',   icon: 'cloud_upload',    pendingHint: 'Sube los documentos requeridos para continuar'     },
  { path: 'revision',   label: 'Revisión',     icon: 'fact_check',      pendingHint: ''                                                   },
];

@Component({
  selector: 'app-onboarding-shell',
  imports: [RouterOutlet, CommonModule, Banner, Button, LoadingSkeleton, OnboardingLayout],
  templateUrl: './onboarding-shell.html',
})
export class OnboardingShell implements OnInit {
  private readonly router            = inject(Router);
  readonly onboardingService         = inject(OnboardingService);
  private readonly authService       = inject(AuthService);
  private readonly destroyRef        = inject(DestroyRef);

  readonly steps     = ONBOARDING_STEPS;
  readonly isLoading = signal(true);
  // Reactivo al signal de auth — se activa en cuanto patchCurrentUser() dispara, sin esperar reload
  readonly submitted = computed(() => this.authService.currentUser()?.onboardingStatus === 'DOCS_SUBMITTED');

  readonly currentStepIndex = signal(0);
  readonly currentStep = computed(() => this.steps[this.currentStepIndex()]);

  readonly isFirst    = computed(() => this.currentStepIndex() === 0);
  readonly isLast     = computed(() => this.currentStepIndex() === this.steps.length - 1);
  readonly canGoNext  = computed(() =>
    this.onboardingService.isStepSaved(this.currentStep().path) &&
    !this.onboardingService.isDirty(this.currentStep().path)
  );

  readonly user = this.authService.currentUser;

  ngOnInit(): void {
    this.onboardingService.loadProfile().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: profile => {
        this.isLoading.set(false);
        // Si ya está enviado, el computed submitted() ya lo refleja — solo salir
        if (profile.onboardingStatus === 'DOCS_SUBMITTED') {
          // Sincronizar el signal de auth con lo que devuelve el backend (fuente de verdad)
          this.authService.patchCurrentUser({ onboardingStatus: 'DOCS_SUBMITTED' });
          return;
        }
        // Sincronizar paso con la URL actual
        this.syncStepFromUrl(this.router.url);
      },
      error: () => this.isLoading.set(false),
    });

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((e: any) => this.syncStepFromUrl(e.url));
  }

  navigateTo(index: number): void {
    if (index < 0 || index >= this.steps.length) return;
    // Bloquear avance si el paso actual no está guardado
    if (index > this.currentStepIndex() && !this.canGoNext()) return;
    this.currentStepIndex.set(index);
    this.router.navigate(['/onboarding', this.steps[index].path]);
  }

  next(): void { this.navigateTo(this.currentStepIndex() + 1); }
  prev(): void { this.navigateTo(this.currentStepIndex() - 1); }

  private syncStepFromUrl(url: string): void {
    const segment = url.split('/').pop()?.split('?')[0] ?? '';
    const idx = this.steps.findIndex(s => s.path === segment);
    if (idx >= 0) this.currentStepIndex.set(idx);
  }
}

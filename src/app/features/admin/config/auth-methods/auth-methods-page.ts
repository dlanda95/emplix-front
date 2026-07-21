import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Banner, Button, ConfirmModal, LoadingSkeleton, PageHeader, SectionCard, AdminPageLayout } from '@shared/ui';
import { AuthMethodsService, AuthMethodConfig } from './auth-methods.service';
import { ToastService } from '@core/services/toast.service';
import { AuthService } from '@core/auth/auth';

@Component({
  selector: 'app-auth-methods-page',
  imports: [CommonModule, ReactiveFormsModule, Banner, Button, ConfirmModal, LoadingSkeleton, PageHeader, SectionCard, AdminPageLayout],
  templateUrl: './auth-methods-page.html',
  host: { style: 'display:block' },
})
export class AuthMethodsPage implements OnInit {
  private readonly svc        = inject(AuthMethodsService);
  private readonly fb         = inject(FormBuilder);
  private readonly toast      = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly auth       = inject(AuthService);

  readonly isAdmin    = computed(() => this.auth.currentUser()?.role === 'COMPANY_ADMIN');
  readonly isLoading  = signal(true);
  readonly loadError  = signal('');
  readonly configs    = signal<AuthMethodConfig[]>([]);
  readonly saving     = signal<string | null>(null); // method being saved

  readonly email     = computed(() => this.configs().find(c => c.method === 'EMAIL'));
  readonly microsoft = computed(() => this.configs().find(c => c.method === 'MICROSOFT'));

  // Form for Microsoft tenant ID
  msForm = this.fb.group({
    azureTenantId: ['', [Validators.required,
      Validators.pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)]],
  });

  readonly msExpanded            = signal(false);
  readonly showDeactivateConfirm = signal<'EMAIL' | 'MICROSOFT' | null>(null);
  readonly showActivateConfirm   = signal(false);

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.isLoading.set(true);
    this.svc.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: list => {
        this.configs.set(list);
        const ms = list.find(c => c.method === 'MICROSOFT');
        if (ms?.azureTenantId) this.msForm.patchValue({ azureTenantId: ms.azureTenantId });
        this.isLoading.set(false);
      },
      error: err => { this.loadError.set(err?.error?.message ?? 'Error al cargar la configuración.'); this.isLoading.set(false); },
    });
  }

  // ── Email ─────────────────────────────────────────────────────────────────

  toggleEmail(): void {
    const enabled = this.email()?.enabled ?? true;
    if (enabled) {
      this.showDeactivateConfirm.set('EMAIL');
    } else {
      this.save('EMAIL', { enabled: true });
    }
  }

  // ── Microsoft ─────────────────────────────────────────────────────────────

  openMsForm(): void {
    // Abrir formulario para configurar (si está desactivado) o cambiar Tenant ID
    this.msExpanded.set(true);
  }

  requestDeactivateMicrosoft(): void {
    this.showDeactivateConfirm.set('MICROSOFT');
  }

  confirmDeactivate(): void {
    const method = this.showDeactivateConfirm();
    if (!method) return;
    this.showDeactivateConfirm.set(null);
    if (method === 'MICROSOFT') {
      this.msExpanded.set(false);
      this.save('MICROSOFT', { enabled: false, azureTenantId: null });
    } else {
      this.save('EMAIL', { enabled: false });
    }
  }

  cancelDeactivate(): void { this.showDeactivateConfirm.set(null); }

  saveMicrosoft(): void {
    this.msForm.markAllAsTouched();
    if (this.msForm.invalid) return;
    this.showActivateConfirm.set(true);
  }

  confirmActivate(): void {
    this.showActivateConfirm.set(false);
    this.save('MICROSOFT', {
      enabled:       true,
      azureTenantId: this.msForm.value.azureTenantId!.trim(),
    });
  }

  cancelActivate(): void { this.showActivateConfirm.set(false); }

  cancelMsForm(): void {
    this.msExpanded.set(false);
    const ms = this.microsoft();
    this.msForm.patchValue({ azureTenantId: ms?.azureTenantId ?? '' });
  }

  private save(method: string, dto: { enabled: boolean; azureTenantId?: string | null }): void {
    this.saving.set(method);
    this.svc.upsert(method, dto).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: updated => {
        this.configs.update(list => {
          const idx = list.findIndex(c => c.method === updated.method);
          return idx >= 0 ? list.map((c, i) => i === idx ? updated : c) : [...list, updated];
        });
        this.msExpanded.set(false);
        this.saving.set(null);
        this.toast.success(`${method === 'EMAIL' ? 'Acceso por email' : 'Microsoft SSO'} ${updated.enabled ? 'activado' : 'desactivado'}.`);
      },
      error: err => {
        this.saving.set(null);
        this.toast.error(err?.error?.message ?? 'Error al guardar la configuración.');
      },
    });
  }
}

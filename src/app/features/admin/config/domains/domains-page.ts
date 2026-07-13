import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Badge, Banner, Button, EmptyState, LoadingSkeleton, Modal, PageHeader, SectionCard, AppInput, AdminPageLayout } from '@shared/ui';
import { DomainsConfigService, TenantDomain } from './domains.service';
import { PermissionsService } from '@core/auth/permissions.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-domains-page',
  imports: [CommonModule, ReactiveFormsModule, Badge, Banner, Button, EmptyState, LoadingSkeleton, Modal, PageHeader, SectionCard, AppInput, AdminPageLayout],
  templateUrl: './domains-page.html',
})
export class DomainsPage implements OnInit {
  private readonly svc        = inject(DomainsConfigService);
  private readonly fb         = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast      = inject(ToastService);
  readonly perms              = inject(PermissionsService);

  readonly domains    = signal<TenantDomain[]>([]);
  readonly isLoading  = signal(true);
  readonly loadError  = signal('');
  readonly isModalOpen = signal(false);
  readonly isSaving   = signal(false);
  readonly saveError  = signal('');

  readonly primary = computed(() => this.domains().find(d => d.isPrimary) ?? null);
  readonly active  = computed(() => this.domains().filter(d => d.isActive));
  readonly inactive = computed(() => this.domains().filter(d => !d.isActive));

  form = this.fb.group({
    domain: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}$/)]],
    label:  [''],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading.set(true);
    this.svc.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:  list => { this.domains.set(list); this.isLoading.set(false); },
      error: err  => { this.loadError.set(err?.error?.message ?? 'Error al cargar los dominios.'); this.isLoading.set(false); },
    });
  }

  openModal(): void {
    this.form.reset();
    this.saveError.set('');
    this.isModalOpen.set(true);
  }

  create(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving.set(true);
    this.saveError.set('');
    this.svc.create({ domain: this.form.value.domain!, label: this.form.value.label || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isModalOpen.set(false);
          this.load();
          this.toast.success('Dominio agregado correctamente.');
        },
        error: err => { this.isSaving.set(false); this.saveError.set(err?.error?.message ?? 'Error al crear el dominio.'); },
      });
  }

  setPrimary(d: TenantDomain): void {
    this.svc.setPrimary(d.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.load(); this.toast.success(`${d.domain} establecido como dominio principal.`); },
      error: () => this.toast.error('Error al cambiar el dominio principal.'),
    });
  }

  toggleActive(d: TenantDomain): void {
    if (d.isPrimary && d.isActive) return;
    this.svc.update(d.id, { isActive: !d.isActive }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.load();
        this.toast.info(d.isActive ? `${d.domain} desactivado.` : `${d.domain} activado.`);
      },
      error: () => this.toast.error('Error al actualizar el dominio.'),
    });
  }

  delete(d: TenantDomain): void {
    this.svc.delete(d.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.load(); this.toast.success(`${d.domain} eliminado.`); },
      error: () => this.toast.error('Error al eliminar el dominio.'),
    });
  }
}

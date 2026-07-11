import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Badge, Banner, Button, LoadingSkeleton,
  ProfileHero, DetailCard, BackLink, ColGrid } from '@shared/ui';
import { EmployeesAdminService, EmployeeDetail as EmployeeDetailData } from '../employees.service';
import { PermissionsService } from '@core/auth/permissions.service';
import { EditLaborDrawer } from '../edit-labor-drawer/edit-labor-drawer';

@Component({
  selector: 'app-employee-detail',
  imports: [CommonModule, Badge, Banner, Button, LoadingSkeleton, EditLaborDrawer,
    ProfileHero, DetailCard, BackLink, ColGrid],
  templateUrl: './employee-detail.html',
  host: { style: 'display:block' },
})
export class EmployeeDetail implements OnInit {
  private readonly svc        = inject(EmployeesAdminService);
  private readonly route      = inject(ActivatedRoute);
  private readonly router     = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly perms              = inject(PermissionsService);

  readonly employee        = signal<EmployeeDetailData | null>(null);
  readonly isLoading       = signal(true);
  readonly loadError       = signal('');
  readonly showLaborDrawer = signal(false);

  readonly fullName = computed(() => {
    const e = this.employee();
    return e ? `${e.firstName} ${e.lastName}` : '';
  });

  readonly supervisorName = computed(() => {
    const s = this.employee()?.supervisor;
    return s ? `${s.firstName} ${s.lastName}` : null;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:  emp => { this.employee.set(emp); this.isLoading.set(false); },
      error: err => { this.loadError.set(err?.error?.message ?? 'No se pudo cargar el perfil.'); this.isLoading.set(false); },
    });
  }

  openLaborDrawer(): void  { this.showLaborDrawer.set(true); }
  closeLaborDrawer(): void { this.showLaborDrawer.set(false); }

  onLaborSaved(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: emp => this.employee.set(emp),
    });
  }

  openCandidate(id: string): void {
    this.router.navigate(['/admin/candidatos', id]);
  }

  salary(): string {
    const s = this.employee()?.laborData?.salary;
    if (!s || Number(s) === 0) return '—';
    return Number(s).toLocaleString('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 });
  }
}

import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import {
  Avatar, Badge, Banner, Button, EmptyState, LoadingSkeleton,
  PageHeader, Pagination, SectionCard, StatCard, AppInput, AppSelect,
  DataTable, EntityCard,
} from '@shared/ui';
import { EmployeesAdminService, EmployeeSummary } from '../employees.service';
import { CandidatesService } from '../../services/candidates.service';
import { CreateEmployeeDrawer } from '../create-employee-drawer/create-employee-drawer';
import type { SelectOption } from '@shared/ui';

const PAGE_SIZE = 25;

@Component({
  selector: 'app-employees-list',
  imports: [
    CommonModule, ReactiveFormsModule,
    Avatar, Badge, Banner, Button, EmptyState, LoadingSkeleton,
    PageHeader, Pagination, SectionCard, StatCard, AppInput, AppSelect,
    DataTable, EntityCard,
    CreateEmployeeDrawer,
  ],
  templateUrl: './employees-list.html',
})
export class EmployeesList implements OnInit {
  private readonly svc        = inject(EmployeesAdminService);
  private readonly orgSvc     = inject(CandidatesService);
  private readonly router     = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly employees  = signal<EmployeeSummary[]>([]);
  readonly total      = signal(0);
  readonly totalPages = signal(1);
  readonly page       = signal(1);
  readonly pageSize   = PAGE_SIZE;
  readonly isLoading  = signal(true);
  readonly loadError  = signal('');

  readonly showCreateDrawer = signal(false);

  readonly deptOptions = signal<SelectOption[]>([]);
  readonly searchCtrl  = new FormControl('');
  readonly deptCtrl    = new FormControl('');

  readonly showRange = computed(() => {
    const from = (this.page() - 1) * PAGE_SIZE + 1;
    const to   = Math.min(this.page() * PAGE_SIZE, this.total());
    return `${from}–${to} de ${this.total()}`;
  });

  ngOnInit(): void {
    this.orgSvc.listDepartments().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(depts => {
      this.deptOptions.set([
        { value: '', label: 'Todos los departamentos' },
        ...depts.map(d => ({ value: d.id, label: d.name })),
      ]);
    });

    this.searchCtrl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => { this.page.set(1); this.load(); });

    this.deptCtrl.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => { this.page.set(1); this.load(); });

    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.svc.list({
      page:         this.page(),
      limit:        PAGE_SIZE,
      search:       this.searchCtrl.value ?? '',
      departmentId: this.deptCtrl.value   ?? '',
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        this.employees.set(result.data);
        this.total.set(result.total);
        this.totalPages.set(result.totalPages);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        this.loadError.set(err?.error?.message ?? 'Error al cargar los colaboradores.');
      },
    });
  }

  onPageChange(p: number): void {
    this.page.set(p);
    this.load();
  }

  onEmployeeCreated(): void {
    this.showCreateDrawer.set(false);
    this.page.set(1);
    this.load();
  }

  fullName(e: EmployeeSummary): string { return `${e.firstName} ${e.lastName}`; }

  supervisorName(e: EmployeeSummary): string {
    const s = e.supervisor;
    return s ? `${s.firstName} ${s.lastName}` : '—';
  }

  openProfile(id: string): void { this.router.navigate(['/admin/colaboradores', id]); }
}

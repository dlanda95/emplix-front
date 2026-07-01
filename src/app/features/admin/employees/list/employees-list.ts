import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Avatar, Badge, Banner, Button, EmptyState, FilterChips, LoadingSkeleton, PageHeader, SectionCard, StatCard, AppInput } from '@shared/ui';
import { EmployeesAdminService, EmployeeSummary } from '../employees.service';
import type { FilterChipItem } from '@shared/ui';

@Component({
  selector: 'app-employees-list',
  imports: [CommonModule, ReactiveFormsModule, Avatar, Badge, Banner, Button, EmptyState, FilterChips, LoadingSkeleton, PageHeader, SectionCard, StatCard, AppInput],
  templateUrl: './employees-list.html',
})
export class EmployeesList implements OnInit {
  private readonly svc        = inject(EmployeesAdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly employees    = signal<EmployeeSummary[]>([]);
  readonly isLoading    = signal(true);
  readonly loadError    = signal('');
  readonly search       = signal('');
  readonly activeFilter = signal('all');
  readonly searchCtrl   = new FormControl('');

  readonly deptChips = computed((): FilterChipItem[] => {
    const counts = new Map<string, number>();
    for (const e of this.employees()) {
      const name = e.department?.name ?? 'Sin área';
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    const chips: FilterChipItem[] = [
      { id: 'all', label: 'Todos', icon: 'groups', count: this.employees().length },
    ];
    for (const [label, count] of counts) {
      chips.push({ id: label, label, count });
    }
    return chips;
  });

  readonly filtered = computed(() => {
    let list = this.employees();
    const q   = this.search().toLowerCase().trim();
    const act = this.activeFilter();

    if (q) {
      list = list.filter(e =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        (e.position?.name?.toLowerCase().includes(q) ?? false) ||
        (e.department?.name?.toLowerCase().includes(q) ?? false) ||
        (e.user?.email?.toLowerCase().includes(q) ?? false) ||
        (e.documentId?.includes(q) ?? false),
      );
    }
    if (act !== 'all') {
      list = list.filter(e => (e.department?.name ?? 'Sin área') === act);
    }
    return list;
  });

  readonly totalDepts = computed(() =>
    new Set(this.employees().map(e => e.department?.id).filter(Boolean)).size,
  );

  readonly totalWithSupervisor = computed(() =>
    this.employees().filter(e => !!e.supervisor).length,
  );

  ngOnInit(): void {
    this.searchCtrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(q => this.search.set(q ?? ''));
    this.svc.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:  list => { this.employees.set(list); this.isLoading.set(false); },
      error: err  => { this.isLoading.set(false); this.loadError.set(err?.error?.message ?? 'Error al cargar los colaboradores.'); },
    });
  }

  fullName(e: EmployeeSummary): string {
    return `${e.firstName} ${e.lastName}`;
  }

  supervisorName(e: EmployeeSummary): string {
    const s = e.supervisor;
    return s ? `${s.firstName} ${s.lastName}` : '—';
  }
}

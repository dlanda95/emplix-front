import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Drawer, AppInput, AppSelect, Button, Banner, FormRow, FormSection } from '@shared/ui';
import type { SelectOption } from '@shared/ui';
import { EmployeesAdminService, EmployeeDetail } from '../employees.service';
import { ToastService } from '@core/services/toast.service';
import { environment } from '@env';

@Component({
  selector: 'app-edit-labor-drawer',
  imports: [CommonModule, ReactiveFormsModule, Drawer, AppInput, AppSelect, Button, Banner, FormRow, FormSection],
  templateUrl: './edit-labor-drawer.html',
})
export class EditLaborDrawer implements OnChanges {
  @Input({ required: true }) isOpen = false;
  @Input() employee: EmployeeDetail | null = null;
  @Output() close   = new EventEmitter<void>();
  @Output() saved   = new EventEmitter<void>();

  private readonly fb         = inject(FormBuilder);
  private readonly svc        = inject(EmployeesAdminService);
  private readonly http       = inject(HttpClient);
  private readonly toast      = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly saving      = signal(false);
  readonly loadingData = signal(false);
  readonly errorMsg    = signal('');

  readonly deptOptions     = signal<SelectOption[]>([]);
  readonly posOptions      = signal<SelectOption[]>([]);
  readonly contractOptions = signal<SelectOption[]>([]);
  readonly shiftOptions    = signal<SelectOption[]>([]);
  readonly empOptions      = signal<SelectOption[]>([]);

  readonly NONE: SelectOption = { value: '', label: 'Sin asignar' };

  form = this.fb.group({
    departmentId:  [''],
    positionId:    [''],
    supervisorId:  [''],
    contractType:  [''],
    workShiftId:   [''],
    salary:        [0, Validators.min(0)],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.errorMsg.set('');
      this.loadFormData();
    }
  }

  private loadFormData(): void {
    this.loadingData.set(true);
    const base = environment.apiUrl;
    forkJoin({
      departments: this.http.get<any[]>(`${base}/organization/departments`),
      positions:   this.http.get<any[]>(`${base}/organization/positions`),
      contracts:   this.http.get<any[]>(`${base}/labor/contracts`),
      shifts:      this.http.get<any[]>(`${base}/labor/shifts`),
      emps:        this.http.get<any[]>(`${base}/employees`),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ departments, positions, contracts, shifts, emps }) => {
        this.loadingData.set(false);
        const allDepts = departments.flatMap((a: any) => [a, ...(a.children ?? [])]);
        this.deptOptions.set([this.NONE, ...allDepts.map((d: any) => ({ value: d.id, label: d.name }))]);
        this.posOptions.set([this.NONE, ...positions.map((p: any) => ({ value: p.id, label: p.name }))]);
        this.contractOptions.set([this.NONE, ...contracts.map((c: any) => ({ value: c.id, label: c.name }))]);
        this.shiftOptions.set([this.NONE, ...shifts.map((s: any) => ({ value: s.id, label: s.name }))]);
        const others = emps.filter((e: any) => e.id !== this.employee?.id);
        this.empOptions.set([this.NONE, ...others.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))]);
        this.patchForm();
      },
      error: () => { this.loadingData.set(false); this.errorMsg.set('Error al cargar los datos del formulario.'); },
    });
  }

  private patchForm(): void {
    const emp = this.employee;
    if (!emp) return;
    this.form.patchValue({
      departmentId: emp.department?.id    ?? '',
      positionId:   emp.position?.id      ?? '',
      supervisorId: emp.supervisor?.id    ?? '',
      contractType: emp.laborData?.contractType?.id ?? '',
      workShiftId:  emp.laborData?.workShift?.id    ?? '',
      salary:       emp.laborData?.salary ?? 0,
    });
  }

  submit(): void {
    if (this.form.invalid || !this.employee) return;
    this.saving.set(true);
    this.errorMsg.set('');

    const v = this.form.value;
    const payload: Record<string, unknown> = {};
    if (v.departmentId !== undefined) payload['departmentId'] = v.departmentId || null;
    if (v.positionId   !== undefined) payload['positionId']   = v.positionId   || null;
    if (v.supervisorId !== undefined) payload['supervisorId'] = v.supervisorId || null;
    if (v.contractType !== undefined && v.contractType) payload['contractType'] = v.contractType;
    if (v.workShiftId  !== undefined && v.workShiftId)  payload['workShiftId']  = v.workShiftId;
    if (v.salary       !== undefined) payload['salary'] = Number(v.salary);

    this.svc.updateAdministrative(this.employee.id, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success('Datos laborales actualizados correctamente.');
          this.saved.emit();
          this.close.emit();
        },
        error: err => {
          this.saving.set(false);
          this.errorMsg.set(err?.error?.message ?? 'Error al guardar. Intenta nuevamente.');
        },
      });
  }

  onClose(): void {
    this.errorMsg.set('');
    this.close.emit();
  }
}

import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { dateRangeValidator } from '@shared/validators/date-range.validator';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Drawer, AppInput, AppSelect, Button, Banner, FormRow, FormSection, Badge } from '@shared/ui';
import type { SelectOption } from '@shared/ui';
import { UsersAdminService, ROLE_LABELS, UserRole } from '../users-admin.service';
import { environment } from '@env';

type Step = 1 | 2 | 3;

@Component({
  selector: 'app-create-employee-drawer',
  imports: [CommonModule, ReactiveFormsModule, Drawer, AppInput, AppSelect, Button, Banner, FormRow, FormSection, Badge],
  templateUrl: './create-employee-drawer.html',
  styleUrl: './create-employee-drawer.scss',
})
export class CreateEmployeeDrawer implements OnChanges {
  @Input({ required: true }) isOpen = false;
  @Output() close   = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private readonly fb          = inject(FormBuilder);
  private readonly svc         = inject(UsersAdminService);
  private readonly http        = inject(HttpClient);
  private readonly destroyRef  = inject(DestroyRef);

  step: Step = 1;
  saving     = false;
  errorMsg   = '';
  successData: { email?: string; tempPassword?: string } | null = null;
  loadingForm = false;

  deptOptions    = signal<SelectOption[]>([]);
  posOptions     = signal<SelectOption[]>([]);
  contractOptions= signal<SelectOption[]>([]);
  shiftOptions   = signal<SelectOption[]>([]);
  empOptions     = signal<SelectOption[]>([]);

  readonly roleOptions: SelectOption[] = Object.entries(ROLE_LABELS)
    .filter(([k]) => k !== 'COMPANY_ADMIN')
    .map(([value, label]) => ({ value, label }));

  step1 = this.fb.group({
    firstName:  ['', Validators.required],
    lastName:   ['', Validators.required],
    email:      ['', [Validators.required, Validators.email]],
    documentId: [''],
    hireDate:   ['', [Validators.required, dateRangeValidator]],
  });

  step2 = this.fb.group({
    departmentId:   [''],
    positionId:     [''],
    supervisorId:   [''],
    contractTypeId: [''],
    workShiftId:    [''],
    salary:         [0, [Validators.min(0)]],
  });

  step3 = this.fb.group({
    grantAccess: [true],
    role:        ['EMPLOYEE'],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.loadFormData();
    }
  }

  private loadFormData(): void {
    this.loadingForm = true;
    const base = environment.apiUrl;
    forkJoin({
      departments: this.http.get<any[]>(`${base}/organization/departments`),
      positions:   this.http.get<any[]>(`${base}/organization/positions`),
      contracts:   this.http.get<any[]>(`${base}/labor/contracts`),
      shifts:      this.http.get<any[]>(`${base}/labor/shifts`),
      emps:        this.http.get<any[]>(`${base}/employees`),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ departments, positions, contracts, shifts, emps }) => {
        this.loadingForm = false;
        const allDepts = departments.flatMap((a: any) => [
          a,
          ...(a.children ?? []),
        ]);
        this.deptOptions.set(allDepts.map((d: any) => ({ value: d.id, label: d.name })));
        this.posOptions.set(positions.map((p: any) => ({ value: p.id, label: p.name })));
        this.contractOptions.set(contracts.map(c => ({ value: c.id, label: c.name })));
        this.shiftOptions.set(shifts.map(s => ({ value: s.id, label: s.name })));
        this.empOptions.set(emps.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` })));
      },
      error: () => { this.loadingForm = false; },
    });
  }

  goTo(s: Step): void { this.step = s; }

  nextStep(): void {
    if (this.step === 1 && this.step1.invalid) { this.step1.markAllAsTouched(); return; }
    if (this.step < 3) this.step = (this.step + 1) as Step;
  }

  prevStep(): void {
    if (this.step > 1) this.step = (this.step - 1) as Step;
  }

  invalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.invalid && c.touched);
  }

  submit(): void {
    this.saving  = true;
    this.errorMsg = '';

    const s1 = this.step1.value;
    const s2 = this.step2.value;
    const s3 = this.step3.value;

    const payload = {
      firstName:       s1.firstName!,
      lastName:        s1.lastName!,
      email:           s1.email!,
      documentId:      s1.documentId || undefined,
      hireDate:        s1.hireDate!,
      departmentId:    s2.departmentId || undefined,
      positionId:      s2.positionId   || undefined,
      supervisorId:    s2.supervisorId  || undefined,
      contractTypeId:  s2.contractTypeId || undefined,
      workShiftId:     s2.workShiftId    || undefined,
      salary:          Number(s2.salary) || 0,
      grantAccess:     !!s3.grantAccess,
      role:            (s3.role as UserRole) || 'EMPLOYEE',
    };

    this.svc.createEmployeeDirect(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        this.saving = false;
        if (res.grantAccess) {
          this.successData = { email: res.email, tempPassword: res.tempPassword };
        } else {
          this.created.emit();
          this.reset();
        }
      },
      error: err => {
        this.saving  = false;
        this.errorMsg = err?.error?.message ?? 'Error al crear el empleado.';
      },
    });
  }

  confirmSuccess(): void {
    this.successData = null;
    this.created.emit();
    this.reset();
  }

  onClose(): void {
    this.reset();
    this.close.emit();
  }

  private reset(): void {
    this.step = 1;
    this.errorMsg = '';
    this.successData = null;
    this.step1.reset();
    this.step2.reset({ salary: 0 });
    this.step3.reset({ grantAccess: true, role: 'EMPLOYEE' });
  }
}

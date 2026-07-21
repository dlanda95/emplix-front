import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth';
import { TenantService } from '@core/services/tenant.service';
import { AppInput, Button, AuthSplitLayout } from '@shared/ui';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AppInput, Button, AuthSplitLayout],
  templateUrl: './register.html',
})
export class Register {
  private readonly fb            = inject(FormBuilder);
  private readonly authService   = inject(AuthService);
  private readonly tenantService = inject(TenantService);
  private readonly router        = inject(Router);

  readonly step         = signal<1 | 2>(1);
  readonly isLoading    = signal(false);
  readonly errorMessage = signal('');
  readonly tenantName   = signal('');

  registerForm: FormGroup = this.fb.group({
    email:           ['', [Validators.required, Validators.email]],
    firstName:       ['', [Validators.required, Validators.minLength(2)]],
    middleName:      ['', [Validators.minLength(2)]],
    lastName:        ['', [Validators.required, Validators.minLength(2)]],
    secondLastName:  [''],
    password:        ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: this.passwordMatchValidator });

  constructor() {
    const currentTenant = this.tenantService.getTenant();
    if (!currentTenant) {
      this.router.navigate(['/auth/login']);
    } else {
      this.tenantName.set(currentTenant);
    }
  }

  getControl(name: string): FormControl {
    return this.registerForm.get(name) as FormControl;
  }

  onSubmit(): void {
    this.errorMessage.set('');
    if (this.step() === 1) this.handleStepOne();
    else this.handleStepTwo();
  }

  changeEmail(): void {
    this.step.set(1);
    this.errorMessage.set('');
    this.registerForm.patchValue({ password: '', confirmPassword: '' });
  }

  private handleStepOne(): void {
    const emailControl = this.getControl('email');
    if (emailControl.invalid) { emailControl.markAsTouched(); return; }

    this.isLoading.set(true);
    this.authService.checkEmailAvailability(emailControl.value).subscribe({
      next: (exists) => {
        this.isLoading.set(false);
        if (exists) {
          this.router.navigate(['/auth/login'], { state: { email: emailControl.value } });
        } else {
          this.step.set(2);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Error de conexión o el servicio no responde.');
      },
    });
  }

  private handleStepTwo(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }

    this.isLoading.set(true);
    this.authService.register(this.registerForm.getRawValue()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/auth/login'], { state: { email: this.getControl('email').value } });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'No se pudo crear la cuenta.');
      },
    });
  }

  private passwordMatchValidator(group: FormGroup) {
    const pass    = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }
}

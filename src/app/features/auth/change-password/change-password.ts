import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/auth/auth';
import { AuthCardLayout } from '@shared/ui';

function passwordStrength(ctrl: AbstractControl): ValidationErrors | null {
  const v = ctrl.value ?? '';
  if (!v) return null;
  if (!/[A-Z]/.test(v)) return { noUppercase: true };
  if (!/[a-z]/.test(v)) return { noLowercase: true };
  if (!/[0-9]/.test(v)) return { noNumber: true };
  return null;
}

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('newPassword')?.value;
  const cfm = group.get('confirm')?.value;
  return pw && cfm && pw !== cfm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-change-password',
  imports: [CommonModule, ReactiveFormsModule, AuthCardLayout],
  templateUrl: './change-password.html',
})
export class ChangePassword {
  private readonly auth       = inject(AuthService);
  private readonly router     = inject(Router);
  private readonly fb         = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(false);
  readonly done      = signal(false);
  readonly error     = signal('');
  readonly showCurr  = signal(false);
  readonly showNew   = signal(false);
  readonly showCfm   = signal(false);

  form = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(8), passwordStrength]],
    confirm:         ['', Validators.required],
  }, { validators: passwordsMatch });

  get pwErrors() { return this.form.get('newPassword')?.errors; }
  get mismatch()  { return this.form.hasError('mismatch') && this.form.get('confirm')?.touched; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.error.set('');

    const { currentPassword, newPassword } = this.form.value;

    this.auth.changePassword(currentPassword!, newPassword!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.done.set(true);
          // Actualizar el flag en la sesión local
          this.auth.patchCurrentUser({ mustChangePassword: false });
          setTimeout(() => this.router.navigate(['/dashboard']), 2500);
        },
        error: err => {
          this.isLoading.set(false);
          this.error.set(err?.error?.message ?? 'Error al cambiar la contraseña. Intenta nuevamente.');
        },
      });
  }
}

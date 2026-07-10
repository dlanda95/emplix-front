import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
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
  const pw  = group.get('password')?.value;
  const cfm = group.get('confirm')?.value;
  return pw && cfm && pw !== cfm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthCardLayout],
  templateUrl: './reset-password.html',
})
export class ResetPassword implements OnInit {
  private readonly auth       = inject(AuthService);
  private readonly fb         = inject(FormBuilder);
  private readonly route      = inject(ActivatedRoute);
  private readonly router     = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly tokenState = signal<'checking' | 'valid' | 'invalid'>('checking');
  readonly isLoading  = signal(false);
  readonly done       = signal(false);
  readonly error      = signal('');
  readonly showPw     = signal(false);
  readonly showCfm    = signal(false);

  private token = '';

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8), passwordStrength]],
    confirm:  ['', Validators.required],
  }, { validators: passwordsMatch });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] ?? '';

    if (!this.token) {
      this.tokenState.set('invalid');
      return;
    }

    this.auth.verifyResetToken(this.token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next:  res => this.tokenState.set(res.valid ? 'valid' : 'invalid'),
        error: ()  => this.tokenState.set('invalid'),
      });
  }

  get pwErrors() { return this.form.get('password')?.errors; }
  get cfmTouched() { return this.form.get('confirm')?.touched; }
  get mismatch() { return this.form.errors?.['mismatch'] && this.cfmTouched; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.error.set('');

    this.auth.resetPassword(this.token, this.form.value.password!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.done.set(true);
          setTimeout(() => this.router.navigate(['/auth/login'], {
            queryParams: { success: 'password_reset' },
          }), 3000);
        },
        error: err => {
          this.isLoading.set(false);
          this.error.set(err?.error?.message ?? 'Error al restablecer la contraseña.');
        },
      });
  }
}

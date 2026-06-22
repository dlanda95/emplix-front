import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { finalize } from 'rxjs';

import { AuthService }   from '@core/auth/auth';
import { TenantService } from '@core/services/tenant.service';
import { InputField, PrimaryBtn } from '@shared/ui';
import { environment } from '@env';

type AuthErrorCode =
  | 'EMAIL_NOT_FOUND'
  | 'WRONG_PASSWORD'
  | 'USER_INACTIVE'
  | 'MICROSOFT_ACCOUNT'
  | 'AZURE_USER_NOT_PROVISIONED'
  | 'AZURE_TENANT_MISMATCH'
  | 'INVALID_MICROSOFT_TOKEN'
  | 'VALIDATION_ERROR'
  | string;

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, InputField, PrimaryBtn],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb            = inject(FormBuilder);
  private readonly tenantService = inject(TenantService);
  readonly authService           = inject(AuthService);
  private readonly router        = inject(Router);
  private readonly msalService   = inject(MsalService);

  readonly step          = signal<1 | 2>(1);
  readonly isLoading     = signal(false);
  readonly isMsalLoading = signal(false);
  readonly errorMessage  = signal('');

  // Refleja si la empresa tiene SSO de Microsoft configurado
  readonly hasMicrosoftSSO = computed(() => this.authService.hasMicrosoftSSO());

  tenantForm = this.fb.group({
    slug: [this.authService.currentTenant() || '', [Validators.required, Validators.minLength(3)]],
  });

  loginForm = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    const savedTenant = this.tenantService.getTenant();
    if (savedTenant) this.tenantForm.patchValue({ slug: savedTenant });

    const state = history.state as { email?: string };
    if (state?.email) {
      this.loginForm.patchValue({ email: state.email });
      if (savedTenant) this.step.set(2);
    }
  }

  getControl(form: FormGroup, name: string): FormControl {
    return form.get(name) as FormControl;
  }

  // ── PASO 1: Verificar empresa ─────────────────────────────────────────────

  onVerifyTenant(): void {
    if (this.tenantForm.invalid) { this.tenantForm.markAllAsTouched(); return; }

    this.isLoading.set(true);
    this.errorMessage.set('');
    const slug = this.tenantForm.get('slug')!.value!;

    this.authService.checkTenantAvailability(slug).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.tenantService.setTenant(slug);
        this.step.set(2);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }

  // ── PASO 2-A: Login con email + contraseña ────────────────────────────────

  onLogin(): void {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;
    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.handleLoginError(err);
      },
    });
  }

  // ── PASO 2-B: Login con Microsoft ─────────────────────────────────────────

  onMicrosoftLogin(): void {
    if (this.isMsalLoading()) return;

    this.isMsalLoading.set(true);
    this.errorMessage.set('');

    this.msalService.loginPopup({
      scopes: ['openid', 'profile', 'email'],
      redirectUri: environment.azure.popupRedirectUri,
    })
      .pipe(finalize(() => this.isMsalLoading.set(false)))
      .subscribe({
        next: (result) => {
          this.authService.loginWithMicrosoft(result.idToken).subscribe({
            next: () => this.router.navigate(['/dashboard']),
            error: (err: HttpErrorResponse) => this.handleLoginError(err),
          });
        },
        error: (msalErr: any) => {
          const code: string = msalErr?.errorCode ?? '';
          const silentCodes = ['user_cancelled', 'popup_window_error', 'access_denied'];
          if (silentCodes.includes(code)) return;

          if (code === 'invalid_client' || msalErr?.message?.includes('AADSTS700016')) {
            this.errorMessage.set('La aplicación de Microsoft no está configurada correctamente. Contacta al administrador.');
            return;
          }
          this.errorMessage.set('No se pudo conectar con Microsoft. Permite las ventanas emergentes e intenta nuevamente.');
        },
      });
  }

  goBack(): void {
    this.tenantService.clearTenant();
    this.step.set(1);
    this.errorMessage.set('');
    this.loginForm.reset();
    this.tenantForm.reset();
  }

  // ── Manejo de errores ─────────────────────────────────────────────────────

  private handleLoginError(err: HttpErrorResponse): void {
    const code    = err.error?.code    as AuthErrorCode | undefined;
    const message = err.error?.message as string        | undefined;

    switch (code) {
      case 'EMAIL_NOT_FOUND':
        this.getControl(this.loginForm, 'email').setErrors({ serverError: message ?? 'El correo no está registrado en esta empresa.' });
        break;
      case 'WRONG_PASSWORD':
        this.getControl(this.loginForm, 'password').setErrors({ serverError: message ?? 'La contraseña es incorrecta.' });
        break;
      case 'USER_INACTIVE':
        this.errorMessage.set(message ?? 'Tu cuenta está desactivada. Contacta al administrador.');
        break;
      case 'MICROSOFT_ACCOUNT':
        this.errorMessage.set('Esta cuenta usa inicio de sesión con Microsoft. Usa el botón "Continuar con Microsoft".');
        break;
      case 'AZURE_USER_NOT_PROVISIONED':
        this.errorMessage.set(message ?? 'Tu cuenta no está configurada en este sistema. Contacta al administrador de RRHH.');
        break;
      case 'AZURE_TENANT_MISMATCH':
        this.errorMessage.set('Tu cuenta de Microsoft no pertenece al directorio de Azure de esta empresa.');
        break;
      case 'INVALID_MICROSOFT_TOKEN':
        this.errorMessage.set('Hubo un problema con la autenticación de Microsoft. Intenta nuevamente.');
        break;
      case 'VALIDATION_ERROR':
        this.errorMessage.set('Verifica los datos ingresados.');
        break;
      default:
        if (err.status === 0) {
          this.errorMessage.set('Sin conexión. Verifica tu red e intenta nuevamente.');
        } else {
          this.errorMessage.set(message ?? 'Error inesperado. Intenta nuevamente.');
        }
    }
  }
}

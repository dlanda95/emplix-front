import { Component, inject, signal, computed, OnInit, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { finalize } from 'rxjs';

import { AuthService }         from '@core/auth/auth';
import { TenantService }       from '@core/services/tenant.service';
import { InputField, PrimaryBtn } from '@shared/ui';
import { DomainsConfigService, PublicDomain } from '@features/admin/config/domains/domains.service';
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
export class Login implements OnInit {
  private readonly fb            = inject(FormBuilder);
  private readonly tenantService = inject(TenantService);
  private readonly route         = inject(ActivatedRoute);
  readonly authService           = inject(AuthService);
  private readonly router        = inject(Router);
  private readonly msalService   = inject(MsalService);
  private readonly domainsSvc    = inject(DomainsConfigService);
  private readonly elRef         = inject(ElementRef);

  readonly step           = signal<1 | 2>(1);
  readonly loginMode      = signal<'colaborador' | 'candidato'>('colaborador');
  readonly isLoading      = signal(false);
  readonly isMsalLoading  = signal(false);
  readonly errorMessage   = signal('');
  readonly sessionExpired    = signal(false);
  readonly passwordResetDone = signal(false);

  // Dominios del tenant
  readonly domains        = signal<PublicDomain[]>([]);
  readonly selectedDomain = signal<PublicDomain | null>(null);
  readonly domainOpen     = signal(false);

  readonly hasDomains    = computed(() => this.domains().length > 0);
  readonly multiDomain   = computed(() => this.domains().length > 1);
  readonly primaryDomain = computed(() => this.domains().find(d => d.isPrimary) ?? this.domains()[0] ?? null);

  readonly hasMicrosoftSSO = computed(() => this.authService.hasMicrosoftSSO());
  readonly isCandidate     = computed(() => this.loginMode() === 'candidato');
  readonly fieldLabel      = computed(() => this.isCandidate() ? 'Número de Documento' : (this.hasDomains() ? 'Usuario' : 'Correo Corporativo'));
  readonly fieldPlaceholder = computed(() => this.isCandidate() ? 'Ej. 12345678' : (this.hasDomains() ? 'nombre.apellido' : 'nombre@empresa.com'));
  readonly fieldIcon       = computed(() => this.isCandidate() ? 'badge' : (this.hasDomains() ? 'person' : 'email'));
  readonly fieldType       = computed(() => this.isCandidate() ? 'text' : (this.hasDomains() ? 'text' : 'email'));
  readonly passwordHint    = computed(() => this.isCandidate() ? 'Tu contraseña inicial es tu número de documento' : '');

  tenantForm = this.fb.group({
    slug: [this.authService.currentTenant() || '', [Validators.required, Validators.minLength(3)]],
  });

  loginForm = this.fb.group({
    email:    ['', [Validators.required]],
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

  ngOnInit(): void {
    if (this.route.snapshot.queryParams['reason'] === 'session_expired') {
      this.sessionExpired.set(true);
    }
    if (this.route.snapshot.queryParams['success'] === 'password_reset') {
      this.passwordResetDone.set(true);
    }
    if (this.tenantService.getTenant()) {
      this.loadDomains();
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
    const slug = this.tenantForm.get('slug')!.value!.toLowerCase().trim();

    this.authService.checkTenantAvailability(slug).subscribe({
      next: () => {
        this.tenantService.setTenant(slug);
        this.loadDomains();
        this.isLoading.set(false);
        this.step.set(2);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }

  private loadDomains(): void {
    this.domainsSvc.getPublicDomains().subscribe({
      next: (list) => {
        this.domains.set(list);
        const primary = list.find(d => d.isPrimary) ?? list[0] ?? null;
        this.selectedDomain.set(primary);
      },
      // Error silencioso: si no hay dominios configurados, el campo de email se muestra completo
    });
  }

  // ── PASO 2-A: Login con email + contraseña ────────────────────────────────

  onLogin(): void {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const rawValue = this.loginForm.value.email!;
    const password = this.loginForm.value.password!;

    // Si hay dominios y el usuario está en modo colaborador, construimos el email completo
    const email = ((!this.isCandidate() && this.hasDomains() && this.selectedDomain())
      ? `${rawValue}@${this.selectedDomain()!.domain}`
      : rawValue).toLowerCase().trim();

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(this.authService.getPostLoginRoute());
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.handleLoginError(err);
      },
    });
  }

  // ── Selector de dominio ───────────────────────────────────────────────────

  toggleDomainMenu(): void {
    if (this.multiDomain()) this.domainOpen.update(v => !v);
  }

  selectDomain(d: PublicDomain): void {
    this.selectedDomain.set(d);
    this.domainOpen.set(false);
  }

  closeDomainMenu(): void { this.domainOpen.set(false); }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.domainOpen() && !this.elRef.nativeElement.contains(event.target)) {
      this.domainOpen.set(false);
    }
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
            next: () => this.router.navigate(this.authService.getPostLoginRoute()),
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

  setLoginMode(mode: 'colaborador' | 'candidato'): void {
    this.loginMode.set(mode);
    this.errorMessage.set('');
    this.loginForm.reset();
    this.domainOpen.set(false);
  }

  goBack(): void {
    this.tenantService.clearTenant();
    this.step.set(1);
    this.errorMessage.set('');
    this.loginForm.reset();
    this.tenantForm.reset();
    this.domains.set([]);
    this.selectedDomain.set(null);
  }

  // ── Manejo de errores ─────────────────────────────────────────────────────

  private handleLoginError(err: HttpErrorResponse): void {
    const code    = err.error?.code    as AuthErrorCode | undefined;
    const message = err.error?.message as string        | undefined;

    switch (code) {
      case 'EMAIL_NOT_FOUND':
        this.getControl(this.loginForm, 'email').setErrors({
          serverError: this.isCandidate()
            ? (message ?? 'El número de documento no está registrado. Contacta a RRHH.')
            : (message ?? 'El usuario no está registrado en esta empresa.'),
        });
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

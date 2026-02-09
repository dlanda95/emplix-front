import { Component, inject,signal,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators,FormControl,FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth';
import { InputField } from '../../../shared/components/ui/input-field/input-field';
import { PrimaryBtn } from '../../../shared/components/ui/primary-btn/primary-btn';
import { ToastService } from '../../../core/services/toast.service';
import { firstValueFrom } from 'rxjs'; // 🔥 IMPORTANTE
import { MsalService } from '@azure/msal-angular'; // 🔥 Inyectamos MSAL aquí directo

// 1. IMPORTAR EL TENANT SERVICE
import { TenantService } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputField, PrimaryBtn],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})



export class Login{private fb = inject(FormBuilder);
  private tenantService = inject(TenantService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Estados UI
  step = signal<1 | 2>(1); 
  isLoading = signal(false);
  errorMessage = signal('');

  // FORMULARIO 1: EMPRESA
  tenantForm = this.fb.group({
    slug: [this.authService.currentTenant() || '', [Validators.required, Validators.minLength(3)]]
  });

  // FORMULARIO 2: USUARIO
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor() {
    // 1. Verificar Tenant guardado
    const savedTenant = this.tenantService.getTenant();
    if (savedTenant) {
      this.tenantForm.patchValue({ slug: savedTenant });
    }

    // 2. Capturar rebote del Registro
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { email: string };

    if (state && state.email) {
      this.loginForm.patchValue({ email: state.email });
      if (savedTenant) {
        this.step.set(2);
      }
    }
  }

  // 🔥 NUEVO HELPER: Esto conecta el HTML con los formularios
  getControl(form: FormGroup, name: string): FormControl {
    return form.get(name) as FormControl;
  }

  // --- PASO 1 ---
  onVerifyTenant() {
    if (this.tenantForm.invalid) {
      this.tenantForm.markAllAsTouched(); // Para ver errores visuales
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    const slug = this.tenantForm.get('slug')?.value!;

    this.authService.checkTenantAvailability(slug).subscribe({
      next: (data) => {
        this.isLoading.set(false);
        this.tenantService.setTenant(slug); 
        this.step.set(2);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Error al verificar empresa.');
      }
    });
  }

  // --- PASO 2 ---
  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.handleError(err);
      }
    });
  }

  goBack() {
        this.tenantService.clearTenant();
    this.step.set(1);
    this.errorMessage.set('');
    this.loginForm.reset();
    this.tenantForm.reset(); // 🔥 ESTO limpia el input del Tenant
  }

  private handleError(err: HttpErrorResponse) {
    if (err.status === 401 || err.status === 404) {
      this.errorMessage.set('Credenciales incorrectas o usuario no existe.');
    } else {
      this.errorMessage.set('Error de conexión. Intenta nuevamente.');
    }
  }
}
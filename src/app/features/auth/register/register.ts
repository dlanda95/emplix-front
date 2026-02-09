import { Component, inject ,signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl,FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth';
import { TenantService } from '../../../core/services/tenant.service';
import { FormControl } from '@angular/forms';

import { InputField } from '../../../shared/components/ui/input-field/input-field';
import { PrimaryBtn } from '../../../shared/components/ui/primary-btn/primary-btn';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputField, PrimaryBtn],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private tenantService = inject(TenantService);
  private router = inject(Router);

  // --- ESTADOS (Usando Signals para mejor reactividad) ---
  step = signal<1 | 2>(1);
  isLoading = signal(false);
  errorMessage = signal<string>(''); // Para mostrar errores en pantalla
  tenantName = signal('');

  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    middleName: ['', [Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    secondLastName: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator }); // Validador a nivel de grupo

  constructor() {
    // 🚨 GATEKEEPER: Verificar Tenant
    const currentTenant = this.tenantService.getTenant();
    if (!currentTenant) {
      this.router.navigate(['/auth/login']); // O a selección de tenant
    } else {
      this.tenantName.set(currentTenant);
    }
  }

  // Helper para el HTML
  getControl(name: string): FormControl {
    return this.registerForm.get(name) as FormControl;
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  // --- ORQUESTADOR PRINCIPAL ---
  onSubmit() {
    this.errorMessage.set(''); // Limpiar errores previos
    console.log('Click en botón. Paso actual:', this.step());

    if (this.step() === 1) {
      this.handleStepOne();
    } else {
      this.handleStepTwo();
    }
  }

  // --- PASO 1: VALIDAR CORREO ---
  private handleStepOne() {
    const emailControl = this.getControl('email');

    // 1. Validación Local
    if (emailControl.invalid) {
      console.log('Formulario inválido:', emailControl.errors);
      emailControl.markAsTouched(); // Esto hace que el input se ponga rojo
      return;
    }

    // 2. Validación Backend
    this.isLoading.set(true);
    const email = emailControl.value;

    this.authService.checkEmailAvailability(email).subscribe({
      next: (exists) => {
        this.isLoading.set(false);
        if (exists) {
          alert('El usuario ya existe. Redirigiendo al login...');
          this.router.navigate(['/auth/login'], { state: { email } });
        } else {
          this.step.set(2); // Avanzar al siguiente paso
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error backend:', err);
        // Mostrar error en pantalla para que el usuario sepa qué pasó
        this.errorMessage.set('Error de conexión o el servicio no responde.');
      }
    });
  }

  // --- PASO 2: REGISTRO ---
  private handleStepTwo() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    // Usamos getRawValue() por si bloqueamos el input de email
    const formData = this.registerForm.getRawValue();

    this.authService.register(formData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/auth/login'],{ 
        state: { 
          email: formData.email 
        } 
      });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'No se pudo crear la cuenta.');
      }
    });
  }

  changeEmail() {
    this.step.set(1);
    this.errorMessage.set('');
    // No borramos el email para permitir correcciones rápidas
    this.registerForm.patchValue({ password: '', confirmPassword: '' });
  }
}
 

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/auth/auth';
import { AuthCardLayout } from '@shared/ui';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthCardLayout],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword implements OnInit {
  private readonly auth  = inject(AuthService);
  private readonly fb    = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  readonly isLoading = signal(false);
  readonly sent      = signal(false);
  readonly error     = signal('');
  readonly tenant    = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    const slug = this.route.snapshot.queryParams['tenant'] as string | undefined;
    if (slug) this.tenant.set(slug);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.error.set('');

    this.auth.forgotPassword(this.form.value.email!.trim().toLowerCase()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.sent.set(true);
      },
      error: () => {
        this.isLoading.set(false);
        // Incluso si hay error del servidor, mostramos el mismo mensaje neutro
        this.sent.set(true);
      },
    });
  }
}

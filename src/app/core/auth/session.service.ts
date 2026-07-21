import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly router = inject(Router);

  private warningTimer?: ReturnType<typeof setTimeout>;
  private expireTimer?: ReturnType<typeof setTimeout>;
  private countdownInterval?: ReturnType<typeof setInterval>;

  readonly minutesLeft = signal<number | null>(null);

  init(): void {
    this.clear();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp as number;
      const expMs = exp * 1000;
      const nowMs  = Date.now();
      const remainMs = expMs - nowMs;

      if (remainMs <= 0) {
        this.forceLogout();
        return;
      }

      const warnMs = remainMs - 5 * 60 * 1000;

      if (warnMs > 0) {
        this.warningTimer = setTimeout(() => this.beginWarning(5), warnMs);
      } else {
        const minsLeft = Math.max(1, Math.ceil(remainMs / 60000));
        this.beginWarning(minsLeft);
      }

      this.expireTimer = setTimeout(() => this.forceLogout(), remainMs);
    } catch {
      // Malformed token — let 401 interceptor handle it
    }
  }

  dismiss(): void {
    this.minutesLeft.set(null);
    clearInterval(this.countdownInterval);
  }

  clear(): void {
    clearTimeout(this.warningTimer);
    clearTimeout(this.expireTimer);
    clearInterval(this.countdownInterval);
    this.minutesLeft.set(null);
  }

  private beginWarning(minutes: number): void {
    this.minutesLeft.set(minutes);
    this.countdownInterval = setInterval(() => {
      const current = this.minutesLeft();
      if (current === null || current <= 1) {
        clearInterval(this.countdownInterval);
        this.minutesLeft.set(null);
      } else {
        this.minutesLeft.set(current - 1);
      }
    }, 60_000);
  }

  private forceLogout(): void {
    this.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login'], {
      queryParams: { reason: 'session_expired' },
    });
  }
}

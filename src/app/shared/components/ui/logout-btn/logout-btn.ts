import { Component, inject, input } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth';

@Component({
  selector: 'app-logout-btn',
  imports: [],
  templateUrl: './logout-btn.html',
  styleUrl: './logout-btn.scss',
})
export class LogoutBtn {
  private authService = inject(AuthService);

  readonly collapsed = input(false);
  readonly variant   = input<'default'|'ghost'>('default');

  onLogout(): void {
    this.authService.logout();
  }
}

import { Component, Input, inject } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth';

@Component({
  selector: 'app-logout-btn',
  imports: [],
  templateUrl: './logout-btn.html',
  styleUrl: './logout-btn.scss',
})
export class LogoutBtn {
  private authService = inject(AuthService);

  // @Input para permitir versión "compacta" (solo icono) si el sidebar se colapsa
  @Input() collapsed = false;
  
  // @Input para permitir versión "oscura" o "clara" si lo usas en fondos distintos
  @Input() variant: 'default' | 'ghost' = 'default';

  onLogout() {
    // Podríamos agregar un confirm("¿Estás seguro?") aquí si quisieras
    this.authService.logout();
  }

}

import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth';

/**
 * Expone los permisos del usuario actual como signals computadas.
 *
 * - Usuarios HR regulares (no system users): acceso completo a todo.
 * - Usuarios de sistema: permisos según el tipo asignado (SystemUserType.permissions).
 *
 * Uso en componentes:
 *   readonly perms = inject(PermissionsService);
 *   [disabled]="!perms.canCreate()"
 */
@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private readonly auth = inject(AuthService);

  private readonly _permissions = computed(() => {
    const user = this.auth.currentUser();
    // Usuarios HR regulares tienen acceso completo — no restringir
    if (!user?.isSystemUser) return null;
    return user.systemUserType?.permissions ?? null;
  });

  private check(key: keyof NonNullable<ReturnType<typeof this._permissions>>): boolean {
    const p = this._permissions();
    return p === null || !!p[key];
  }

  readonly canRead         = computed(() => this.check('canRead'));
  readonly canCreate       = computed(() => this.check('canCreate'));
  readonly canEdit         = computed(() => this.check('canEdit'));
  readonly canDelete       = computed(() => this.check('canDelete'));
  readonly canApprove      = computed(() => this.check('canApprove'));
  readonly canManageConfig = computed(() => this.check('canManageConfig'));
  readonly canManageUsers  = computed(() => this.check('canManageUsers'));
}

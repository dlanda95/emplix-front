import { Component, input } from '@angular/core';
import { PermChip } from '../perm-chip/perm-chip';

export interface TypePermissions {
  canRead: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canManageConfig: boolean;
}

@Component({
  selector: 'app-type-preview',
  imports: [PermChip],
  template: `
    <div class="tp" [style.border-left-color]="color()">
      <span class="tp__name" [style.color]="color()">{{ name() }}</span>
      @if (description()) {
        <p class="tp__desc">{{ description() }}</p>
      }
      @if (permissions()) {
        @let p = permissions()!;
        <div class="tp__perms">
          <app-perm-chip [on]="p.canRead"         icon="visibility">Leer</app-perm-chip>
          <app-perm-chip [on]="p.canCreate"        icon="add_circle">Crear</app-perm-chip>
          <app-perm-chip [on]="p.canEdit"          icon="edit">Editar</app-perm-chip>
          <app-perm-chip [on]="p.canDelete"        icon="delete">Eliminar</app-perm-chip>
          <app-perm-chip [on]="p.canApprove"       icon="task_alt">Aprobar</app-perm-chip>
          <app-perm-chip [on]="p.canManageConfig"  icon="settings">Config</app-perm-chip>
        </div>
      }
    </div>
  `,
  styleUrl: './type-preview.scss',
})
export class TypePreview {
  readonly color       = input.required<string>();
  readonly name        = input.required<string>();
  readonly description = input<string>('');
  readonly permissions = input<TypePermissions | null>(null);
}

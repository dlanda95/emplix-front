import { Component, input } from '@angular/core';

@Component({
  selector: 'app-perm-chip',
  template: `
    <span class="pc" [class.pc--on]="on()">
      @if (icon()) {
        <span class="material-icons-round">{{ icon() }}</span>
      }
      <ng-content></ng-content>
    </span>
  `,
  styleUrl: './perm-chip.scss',
})
export class PermChip {
  readonly on   = input<boolean>(false);
  readonly icon = input<string>('');
}

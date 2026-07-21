import { Component, input } from '@angular/core';

@Component({
  selector: 'app-col-grid',
  template: `<div class="cg" [class]="'cg--' + cols()"><ng-content></ng-content></div>`,
  styleUrl: './col-grid.scss',
})
export class ColGrid {
  readonly cols = input<1 | 2 | 3>(2);
}

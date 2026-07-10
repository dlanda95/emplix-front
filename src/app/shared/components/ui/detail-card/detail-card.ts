import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-detail-card',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="dc">
      <div class="dc__header">
        <span class="material-icons-round">{{ icon() }}</span>
        <h3>{{ title() }}</h3>
      </div>
      <dl class="dc__dl">
        <ng-content></ng-content>
      </dl>
    </div>
  `,
  styleUrl: './detail-card.scss',
})
export class DetailCard {
  readonly icon  = input.required<string>();
  readonly title = input.required<string>();
}

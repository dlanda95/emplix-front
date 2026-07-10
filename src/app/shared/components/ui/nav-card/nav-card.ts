import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-nav-card',
  template: `
    <button class="nc" (click)="clicked.emit()">
      <div class="nc__header">
        <div class="nc__icon" [style.background]="color() + '18'" [style.color]="color()">
          <span class="material-icons-round">{{ icon() }}</span>
        </div>
        <span class="material-icons-round nc__arrow">arrow_forward</span>
      </div>
      <div class="nc__body">
        <h3 class="nc__title">{{ title() }}</h3>
        <p class="nc__desc">{{ description() }}</p>
      </div>
      @if (tags().length) {
        <div class="nc__tags">
          @for (tag of tags(); track tag) {
            <span class="nc__tag" [style.color]="color()" [style.background]="color() + '14'">
              {{ tag }}
            </span>
          }
        </div>
      }
      <div class="nc__bar" [style.background]="color()"></div>
    </button>
  `,
  styleUrl: './nav-card.scss',
})
export class NavCard {
  readonly icon        = input.required<string>();
  readonly color       = input.required<string>();
  readonly title       = input.required<string>();
  readonly description = input.required<string>();
  readonly tags        = input<string[]>([]);
  readonly clicked     = output<void>();
}

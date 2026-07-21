import { Component, input } from '@angular/core';
import { Avatar } from '../avatar/avatar';

@Component({
  selector: 'app-profile-hero',
  imports: [Avatar],
  template: `
    <div class="ph">
      <app-avatar [name]="name()" [src]="avatarSrc()" size="xl"></app-avatar>
      <div class="ph__info">
        <h1 class="ph__name">{{ name() }}</h1>
        @if (role()) {
          <p class="ph__role">{{ role() }}</p>
        }
        <div class="ph__tags">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styleUrl: './profile-hero.scss',
})
export class ProfileHero {
  readonly name      = input.required<string>();
  readonly role      = input<string>('');
  readonly avatarSrc = input<string | undefined>(undefined);
}

import { Component, input, ViewEncapsulation } from '@angular/core';
import { Avatar } from '../avatar/avatar';

@Component({
  selector: 'app-entity-card',
  imports: [Avatar],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './entity-card.html',
  styleUrl: './entity-card.scss',
})
export class EntityCard {
  readonly name      = input.required<string>();
  readonly subtitle  = input<string>('');
  readonly avatarSrc = input<string | undefined>(undefined);
}

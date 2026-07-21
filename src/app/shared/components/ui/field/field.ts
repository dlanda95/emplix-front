import { Component, input } from '@angular/core';

@Component({
  selector: 'app-field',
  imports: [],
  templateUrl: './field.html',
  styleUrl: './field.scss',
})
export class Field {
  readonly label = input.required<string>();
  readonly value = input<string|number|null|undefined>(undefined);
}

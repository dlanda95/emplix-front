import { Component, input } from '@angular/core';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.html',
  styleUrl: './list-item.scss',
})
export class ListItem {
  readonly name = input.required<string>();
  readonly icon = input<string>('person');
}

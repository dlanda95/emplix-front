import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  imports: [],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyState {
  readonly icon        = input('inbox');
  readonly title       = input('Sin resultados');
  readonly description = input('');
  readonly compact     = input(false);
}

import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-banner',
  imports: [NgClass],
  templateUrl: './banner.html',
  styleUrl: './banner.scss',
})
export class Banner {
  readonly variant     = input<'warning'|'info'|'success'|'error'>('info');
  readonly icon        = input('');
  readonly title       = input('');
  readonly dismissible = input(false);

  readonly dismissed = output<void>();
}

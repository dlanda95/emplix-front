import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-button',
  imports: [NgClass],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  readonly variant   = input<'primary'|'secondary'|'ghost'|'danger'>('primary');
  readonly size      = input<'sm'|'md'|'lg'>('md');
  readonly disabled  = input(false);
  readonly loading   = input(false);
  readonly fullWidth = input(false);
  readonly type      = input<'button'|'submit'|'reset'>('button');
  readonly icon      = input('');

  readonly clicked = output<Event>();

  onClick(event: Event): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}

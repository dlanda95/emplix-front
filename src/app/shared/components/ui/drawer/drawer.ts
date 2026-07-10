import { Component, HostListener, effect, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-drawer',
  imports: [],
  templateUrl: './drawer.html',
  styleUrl: './drawer.scss',
})
export class Drawer {
  readonly isOpen   = input.required<boolean>();
  readonly title    = input.required<string>();
  readonly subtitle = input('');
  readonly width    = input<'sm'|'md'|'lg'>('md');

  readonly close = output<void>();

  readonly visible   = signal(false);
  readonly animating = signal(false);

  private _prevIsOpen = false;

  constructor() {
    effect(() => {
      const open = this.isOpen();
      if (open === this._prevIsOpen) return;
      this._prevIsOpen = open;
      if (open) {
        this.visible.set(true);
        setTimeout(() => this.animating.set(true), 10);
      } else {
        this.animating.set(false);
        setTimeout(() => this.visible.set(false), 350);
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.isOpen()) this.close.emit();
  }
}

import { Component, Input, Output, EventEmitter, HostListener, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-drawer',
  imports: [CommonModule],
  templateUrl: './drawer.html',
  styleUrl: './drawer.scss',
})
export class Drawer implements OnChanges {
  @Input({ required: true }) isOpen = false;
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() width: 'sm' | 'md' | 'lg' = 'md';
  @Output() close = new EventEmitter<void>();

  readonly visible   = signal(false);
  readonly animating = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.visible.set(true);
        setTimeout(() => this.animating.set(true), 10);
      } else {
        this.animating.set(false);
        setTimeout(() => this.visible.set(false), 350);
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.isOpen) this.close.emit();
  }
}

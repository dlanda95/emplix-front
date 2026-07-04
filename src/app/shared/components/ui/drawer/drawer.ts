import { Component, Input, Output, EventEmitter, HostListener, OnChanges, SimpleChanges } from '@angular/core';
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

  visible = false;
  animating = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.visible = true;
        setTimeout(() => this.animating = true, 10);
      } else {
        this.animating = false;
        setTimeout(() => this.visible = false, 350);
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.isOpen) this.close.emit();
  }
}

import { Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  readonly isOpen = input.required<boolean>();
  readonly title  = input.required<string>();

  readonly close = output<void>();

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.isOpen()) this.close.emit();
  }

  onBackdropClick(): void {
    this.close.emit();
  }
}

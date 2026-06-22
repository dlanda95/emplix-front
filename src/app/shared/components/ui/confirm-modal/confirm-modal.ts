import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Button } from '../button/button';

@Component({
  selector: 'app-confirm-modal',
  imports: [Button],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
})
export class ConfirmModal {
  @Input() isOpen = false;
  @Input() title = '¿Estás seguro?';
  @Input() message = '';
  @Input() icon = 'help_outline';
  @Input() confirmLabel = 'Confirmar';
  @Input() confirmVariant: 'primary' | 'danger' = 'primary';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.isOpen) this.cancelled.emit();
  }
}

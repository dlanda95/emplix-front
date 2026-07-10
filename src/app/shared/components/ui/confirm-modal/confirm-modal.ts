import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Button } from '../button/button';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-confirm-modal',
  imports: [Button, Modal],
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
}

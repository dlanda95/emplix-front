import { Component, input, output } from '@angular/core';
import { Button } from '../button/button';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-confirm-modal',
  imports: [Button, Modal],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
})
export class ConfirmModal {
  readonly isOpen         = input(false);
  readonly title          = input('¿Estás seguro?');
  readonly message        = input('');
  readonly icon           = input('help_outline');
  readonly confirmLabel   = input('Confirmar');
  readonly confirmVariant = input<'primary'|'danger'>('primary');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}

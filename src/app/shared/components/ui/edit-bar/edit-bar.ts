import { Component, input, output } from '@angular/core';
import { Button } from '../button/button';

@Component({
  selector: 'app-edit-bar',
  imports: [Button],
  templateUrl: './edit-bar.html',
  styleUrl: './edit-bar.scss',
})
export class EditBar {
  readonly isSubmitting = input<boolean>(false);
  readonly canSubmit    = input<boolean>(true);
  readonly submitLabel  = input<string>('Guardar');
  readonly loadingLabel = input<string>('Guardando...');
  readonly submitIcon   = input<string>('save');

  readonly cancelled = output<void>();
  readonly submitted = output<void>();
}

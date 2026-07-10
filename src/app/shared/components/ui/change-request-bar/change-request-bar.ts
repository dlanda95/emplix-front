import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { Button } from '../button/button';

@Component({
  selector: 'app-change-request-bar',
  imports: [NgClass, Button],
  templateUrl: './change-request-bar.html',
})
export class ChangeRequestBar {
  readonly section          = input('');
  readonly sectionIcon      = input('edit_note');
  readonly description      = input('');
  readonly isPending        = input(false);
  readonly isEditing        = input(false);
  readonly isSubmitting     = input(false);
  readonly canSubmit        = input(true);
  readonly actionLabel      = input('Solicitar corrección');
  readonly actionIcon       = input('edit');
  readonly requiresApproval = input(true);

  readonly editRequested = output<void>();
  readonly submitted     = output<void>();
  readonly cancelled     = output<void>();
}

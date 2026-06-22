import { Component, Input, forwardRef, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-field.html',
  styleUrl: './input-field.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputField),
      multi: true,
    },
  ],
})
export class InputField {
  label       = input('');
  type        = input('text');
  placeholder = input('');
  control     = input.required<FormControl>();
  icon        = input('');
  hint        = input('');
  readonly    = input(false);

  readonly focused = signal(false);

  get isInvalid(): boolean {
    return this.control().invalid && this.control().touched;
  }

  get hasServerError(): boolean {
    return this.control().hasError('serverError');
  }

  get showErrorMessage(): boolean {
    // Server errors always visible once set; validation errors only while focused
    return this.isInvalid && (this.focused() || this.hasServerError);
  }

  onFocus(): void {
    this.focused.set(true);
    // Clear server-set error so user can re-attempt without stale message
    this.clearServerError();
  }

  onBlur(): void {
    this.focused.set(false);
    this.control().markAsTouched();
  }

  private clearServerError(): void {
    const errors = this.control().errors;
    if (!errors || !('serverError' in errors)) return;

    const { serverError: _, ...rest } = errors;
    this.control().setErrors(Object.keys(rest).length ? rest : null);
  }
}

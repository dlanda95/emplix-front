import { Component, Optional, Self, input, signal } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  imports: [],
  templateUrl: './input.html',
  styleUrl: './input.scss',
})
export class AppInput implements ControlValueAccessor {
  readonly label       = input('');
  readonly type        = input('text');
  readonly placeholder = input('');
  readonly icon        = input('');
  readonly hint        = input('');
  readonly readonly    = input(false);
  readonly min         = input<string | undefined>(undefined);
  readonly max         = input<string | undefined>(undefined);
  readonly maxlength   = input<number | undefined>(undefined);
  readonly inputmode   = input<string>('text');
  readonly numericOnly = input(false);

  readonly focused = signal(false);
  isDisabled = false;

  _value: any = '';
  private _onChange: (v: any) => void = () => {};
  private _onTouched: () => void = () => {};

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (ngControl) ngControl.valueAccessor = this;
  }

  get control() { return this.ngControl?.control; }

  get isInvalid(): boolean {
    return !!this.control && this.control.invalid && this.control.touched;
  }

  get hasServerError(): boolean {
    return !!this.control?.hasError('serverError');
  }

  get showErrorMessage(): boolean {
    return this.isInvalid && (this.focused() || this.hasServerError);
  }

  onFocus(): void {
    this.focused.set(true);
    this.clearServerError();
  }

  onBlur(): void {
    this.focused.set(false);
    this._onTouched();
    this.control?.markAsTouched();
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let v = this.numericOnly() ? target.value.replace(/\D/g, '') : target.value;
    const max = this.maxlength();
    if (max !== undefined && v.length > max) v = v.slice(0, max);
    if (target.value !== v) target.value = v;
    this._value = v;
    this._onChange(v);
  }

  writeValue(value: any): void { this._value = value ?? ''; }
  registerOnChange(fn: any): void { this._onChange = fn; }
  registerOnTouched(fn: any): void { this._onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled = isDisabled; }

  private clearServerError(): void {
    if (!this.control) return;
    const errors = this.control.errors;
    if (!errors || !('serverError' in errors)) return;
    const { serverError: _, ...rest } = errors;
    this.control.setErrors(Object.keys(rest).length ? rest : null);
  }
}

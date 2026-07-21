import { Component, Optional, Self, input, signal } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  imports: [],
  templateUrl: './app-textarea.html',
  styleUrl: './app-textarea.scss',
  host: { style: 'display:block; width:100%' },
})
export class AppTextarea implements ControlValueAccessor {
  readonly label       = input('');
  readonly placeholder = input('');
  readonly rows        = input<number>(4);
  readonly hint        = input('');
  readonly readonly    = input(false);

  readonly focused = signal(false);
  isDisabled = false;

  _value: string = '';
  private _onChange: (v: string) => void = () => {};
  private _onTouched: () => void = () => {};

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (ngControl) ngControl.valueAccessor = this;
  }

  get control() { return this.ngControl?.control; }

  get isInvalid(): boolean {
    return !!this.control && this.control.invalid && this.control.touched;
  }

  onFocus(): void { this.focused.set(true); }

  onBlur(): void {
    this.focused.set(false);
    this._onTouched();
    this.control?.markAsTouched();
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this._value = val;
    this._onChange(val);
  }

  writeValue(value: any): void  { this._value = value ?? ''; }
  registerOnChange(fn: any): void  { this._onChange = fn; }
  registerOnTouched(fn: any): void { this._onTouched = fn; }
  setDisabledState(d: boolean): void { this.isDisabled = d; }
}

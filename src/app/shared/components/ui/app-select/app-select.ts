import { Component, forwardRef, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AppSelect),
    multi: true,
  }],
  templateUrl: './app-select.html',
  styleUrl: './app-select.scss',
})
export class AppSelect implements ControlValueAccessor {
  readonly label       = input.required<string>();
  readonly options     = input.required<SelectOption[]>();
  readonly placeholder = input<string>('— Seleccionar —');

  readonly internalValue = signal<string>('');
  readonly isDisabled    = signal(false);

  private _onChange  = (_: string) => {};
  private _onTouched = () => {};

  writeValue(val: string | null): void {
    this.internalValue.set(val ?? '');
  }

  registerOnChange(fn: (_: string) => void): void  { this._onChange = fn; }
  registerOnTouched(fn: () => void): void          { this._onTouched = fn; }
  setDisabledState(disabled: boolean): void        { this.isDisabled.set(disabled); }

  handleChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.internalValue.set(val);
    this._onChange(val);
    this._onTouched();
  }
}

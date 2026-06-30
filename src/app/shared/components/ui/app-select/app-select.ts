import { Component, ElementRef, ViewChild, effect, forwardRef, input, signal } from '@angular/core';
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

  @ViewChild('selectEl') private selectEl?: ElementRef<HTMLSelectElement>;

  readonly internalValue = signal<string>('');
  readonly isDisabled    = signal(false);

  private _onChange  = (_: string) => {};
  private _onTouched = () => {};

  constructor() {
    // Depende de AMBAS señales: cuando options() cambia (nuevas opciones en DOM)
    // O internalValue() cambia, re-sincroniza el elemento nativo.
    // El effect corre DESPUÉS del render, así que las opciones ya están en el DOM.
    effect(() => {
      this.options(); // suscribirse a cambios de opciones
      const val = this.internalValue();
      if (this.selectEl?.nativeElement) {
        this.selectEl.nativeElement.value = val;
      }
    });
  }

  writeValue(val: unknown): void {
    this.internalValue.set(val != null ? String(val) : '');
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

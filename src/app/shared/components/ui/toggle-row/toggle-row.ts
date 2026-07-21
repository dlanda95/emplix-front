import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-toggle-row',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ToggleRow),
    multi: true,
  }],
  template: `
    <div class="tr-row">
      <div class="tr-row__info">
        <span class="tr-row__title">{{ label() }}</span>
        @if (description()) {
          <span class="tr-row__desc">{{ description() }}</span>
        }
      </div>
      <label class="tr-toggle">
        <input type="checkbox" [checked]="checked" (change)="onToggle($event)" [disabled]="isDisabled">
        <span class="tr-toggle__track">
          <span class="tr-toggle__thumb"></span>
        </span>
      </label>
    </div>
  `,
  styleUrl: './toggle-row.scss',
})
export class ToggleRow implements ControlValueAccessor {
  readonly label       = input.required<string>();
  readonly description = input<string>('');

  checked    = false;
  isDisabled = false;

  private onChange  = (_: boolean) => {};
  private onTouched = () => {};

  writeValue(val: boolean): void     { this.checked = !!val; }
  registerOnChange(fn: any): void    { this.onChange = fn; }
  registerOnTouched(fn: any): void   { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.isDisabled = d; }

  onToggle(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.checked = checked;
    this.onChange(checked);
    this.onTouched();
  }
}

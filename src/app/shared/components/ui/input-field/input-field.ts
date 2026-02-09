import { Component, Input, forwardRef,input ,signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor,FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';



@Component({
  selector: 'app-input-field',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-field.html',
  styleUrl: './input-field.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputField),
      multi: true
    }
  ]
})
export class InputField {// --- INPUTS (Configuración visual) ---
  // Usamos 'input' (Signals) para modernizar y alinear con tu Register
  label = input('');
  type = input('text');
  placeholder = input('');
  control = input.required<FormControl>();
  icon = input('');
  hint = input(''); // Opcional: Para texto de ayuda gris
  readonly = input(false);

  // 🔥 NUEVO ESTADO: Saber si el input tiene el foco
  focused = signal(false);
  // Helper para saber si hay error (Validación de Angular)
  get isInvalid(): boolean {
    return this.control().invalid && this.control().touched;
  }
 // 🔥 LÓGICA APPLE: 
  // Mostrar mensaje de TEXTO solo si es inválido Y está enfocado
  get showErrorMessage(): boolean {
    return this.isInvalid && this.focused();
  }

  // Manejadores de eventos para el HTML
  onFocus() {
    this.focused.set(true);
  }

  onBlur() {
    this.focused.set(false);
    this.control().markAsTouched(); // Marcamos que el usuario ya pasó por aquí
  }
}

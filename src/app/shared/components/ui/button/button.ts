import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {

// Variantes visuales
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary';
  
  // Tamaños
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  
  // Estados
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;
  
  // Tipo nativo (submit para formularios, button para acciones)
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  
  // Icono opcional (Material Icons)
  @Input() icon?: string;

  // Evento de clic protegido
  @Output() clicked = new EventEmitter<Event>();

  onClick(event: Event) {
    // Si está cargando o deshabilitado, bloqueamos el clic
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }



}

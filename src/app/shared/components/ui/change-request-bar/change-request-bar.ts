import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';
import { Button } from '../button/button';

@Component({
  selector: 'app-change-request-bar',
  imports: [NgClass, Button],
  templateUrl: './change-request-bar.html',
})
export class ChangeRequestBar {
  /** Nombre de la sección (ej. "Dirección", "Financiero") */
  @Input() section = '';
  /** Ícono Material Icons para la sección */
  @Input() sectionIcon = 'edit_note';
  /** Descripción corta de qué datos contiene */
  @Input() description = '';
  /** Si hay una solicitud pendiente en esta sección */
  @Input() isPending = false;
  /** Modo edición inline activo (solo para mis-datos) */
  @Input() isEditing = false;
  /** Estado de envío del formulario inline */
  @Input() isSubmitting = false;
  /** Si el formulario inline es válido */
  @Input() canSubmit = true;
  /** Texto del botón principal */
  @Input() actionLabel = 'Solicitar corrección';
  /** Ícono del botón principal */
  @Input() actionIcon = 'edit';
  /** Si true, muestra el aviso de que el cambio pasa por RRHH */
  @Input() requiresApproval = true;

  @Output() editRequested = new EventEmitter<void>();
  @Output() submitted     = new EventEmitter<void>();
  @Output() cancelled     = new EventEmitter<void>();
}

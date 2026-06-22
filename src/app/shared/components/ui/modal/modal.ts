import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {



  @Input({ required: true }) isOpen: boolean = false;
  @Input({ required: true }) title!: string;
  @Output() close = new EventEmitter<void>();

  // Cierra el modal con la tecla ESC
  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: Event) {
    if (this.isOpen) this.close.emit();
  }

  // Cierra si hace clic en el fondo borroso (fuera de la caja blanca)
  onBackdropClick(event: MouseEvent) {
    this.close.emit();
  }

}

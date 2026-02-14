import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-card',
  imports: [CommonModule],
  templateUrl: './section-card.html',
  styleUrl: './section-card.scss',
})
export class SectionCard {
@Input() title = '';
  @Input() subtitle = '';
  @Input() noPadding = false; // Opción para tablas que van de borde a borde
}

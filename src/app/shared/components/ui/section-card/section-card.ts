import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-section-card',
  imports: [CommonModule],
  templateUrl: './section-card.html',
  styleUrl: './section-card.scss',
})
export class SectionCard {

  @Input({ required: true }) title!: string;
  @Input() columns: number = 3; // Por defecto 3 columnas

}

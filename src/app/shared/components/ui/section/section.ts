import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-section',
  imports: [CommonModule],
  templateUrl: './section.html',
  styleUrl: './section.scss',
})
export class Section {

  @Input({ required: true }) title!: string;
  @Input() columns: number = 3; // Por defecto 3 columnas

}

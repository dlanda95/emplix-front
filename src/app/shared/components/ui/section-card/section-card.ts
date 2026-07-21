import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-section-card',
  imports: [NgClass],
  templateUrl: './section-card.html',
  styleUrl: './section-card.scss',
})
export class SectionCard {
  readonly title   = input.required<string>();
  readonly columns = input(3);
}

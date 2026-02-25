import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-field',
  imports: [CommonModule],
  templateUrl: './field.html',
  styleUrl: './field.scss',
})
export class Field {

  @Input({ required: true }) label!: string;
  @Input() value?: string | number | null;

}

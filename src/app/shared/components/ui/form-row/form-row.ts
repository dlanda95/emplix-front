import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-form-row',
  imports: [NgClass],
  templateUrl: './form-row.html',
  styleUrl: './form-row.scss',
})
export class FormRow {
  readonly cols = input<1 | 2 | 3>(2);
}

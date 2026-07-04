import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-section',
  templateUrl: './form-section.html',
  styleUrl: './form-section.scss',
})
export class FormSection {
  readonly title = input.required<string>();
  readonly icon  = input<string>();
}

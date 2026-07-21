import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-drawer-stepper',
  template: `
    <div class="ds">
      @for (label of steps(); track $index) {
        @let i = $index + 1;
        @let done = currentStep() > i;
        @let active = currentStep() === i;
        <div class="ds__item" [class.ds__item--active]="active" [class.ds__item--done]="done">
          <button class="ds__dot" (click)="done ? stepClick.emit(i) : null" [disabled]="!done">
            @if (done) {
              <span class="material-icons-round">check</span>
            } @else {
              {{ i }}
            }
          </button>
          <span class="ds__label">{{ label }}</span>
        </div>
        @if ($index < steps().length - 1) {
          <div class="ds__line" [class.ds__line--done]="currentStep() > i"></div>
        }
      }
    </div>
  `,
  styleUrl: './drawer-stepper.scss',
})
export class DrawerStepper {
  readonly steps       = input.required<string[]>();
  readonly currentStep = input<number>(1);
  readonly stepClick   = output<number>();
}

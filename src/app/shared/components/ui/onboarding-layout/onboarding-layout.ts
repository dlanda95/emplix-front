import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-onboarding-layout',
  template: '<ng-content></ng-content>',
  styleUrl: './onboarding-layout.scss',
  encapsulation: ViewEncapsulation.None,
  host: { style: 'display:block' },
})
export class OnboardingLayout {}

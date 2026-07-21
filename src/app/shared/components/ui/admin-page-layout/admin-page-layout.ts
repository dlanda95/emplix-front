import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-admin-page-layout',
  template: '<ng-content></ng-content>',
  styleUrl: './admin-page-layout.scss',
  encapsulation: ViewEncapsulation.None,
  host: { style: 'display:block' },
})
export class AdminPageLayout {}

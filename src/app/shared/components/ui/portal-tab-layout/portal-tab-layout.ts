import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-portal-tab-layout',
  template: '<ng-content></ng-content>',
  styleUrl: './portal-tab-layout.scss',
  encapsulation: ViewEncapsulation.None,
  host: { style: 'display:block' },
})
export class PortalTabLayout {}

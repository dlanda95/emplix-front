import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-auth-split-layout',
  template: '<ng-content></ng-content>',
  styleUrl: './auth-split-layout.scss',
  encapsulation: ViewEncapsulation.None,
  host: { style: 'display:block; width:100%' },
})
export class AuthSplitLayout {}

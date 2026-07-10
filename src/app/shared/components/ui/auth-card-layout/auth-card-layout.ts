import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-auth-card-layout',
  template: '<ng-content></ng-content>',
  styleUrl: './auth-card-layout.scss',
  encapsulation: ViewEncapsulation.None,
  host: { style: 'display:block; width:100%' },
})
export class AuthCardLayout {}

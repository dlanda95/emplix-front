import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-back-link',
  imports: [RouterLink],
  template: `
    <a [routerLink]="to()" class="bl">
      <span class="material-icons-round">arrow_back</span>
      <ng-content></ng-content>
    </a>
  `,
  styleUrl: './back-link.scss',
})
export class BackLink {
  readonly to = input.required<string | any[]>();
}

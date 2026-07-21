import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-data-table',
  template: `
    <div class="dt-wrap">
      <table class="dt">
        <ng-content></ng-content>
      </table>
    </div>
  `,
  styleUrl: './data-table.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DataTable {}

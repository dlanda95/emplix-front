import { Component, input } from '@angular/core';

@Component({
  selector: 'app-map-widget',
  imports: [],
  templateUrl: './map-widget.html',
  styleUrl: './map-widget.scss',
})
export class MapWidget {
  readonly address = input('');
  readonly city    = input('');
}

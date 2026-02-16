import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-map-widget',
  imports: [CommonModule],
  templateUrl: './map-widget.html',
  styleUrl: './map-widget.scss',
})
export class MapWidget {

  @Input() address!: string;
  @Input() city!: string;

}

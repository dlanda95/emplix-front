import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-banner',
  imports: [CommonModule],
  templateUrl: './banner.html',
  styleUrl: './banner.scss',
})
export class Banner {
  @Input() variant:    'warning' | 'info' | 'success' | 'error' = 'info';
  @Input() icon?:      string;
  @Input() title?:     string;
  @Input() dismissible = false;

  @Output() dismissed = new EventEmitter<void>();
}

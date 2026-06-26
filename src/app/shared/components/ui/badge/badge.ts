import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-badge',
  imports: [CommonModule],
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
})
export class Badge {

  @Input() variant: 'success' | 'warning' | 'error' | 'neutral' | 'primary' = 'neutral';
}



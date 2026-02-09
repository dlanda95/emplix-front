import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {

  @Input() label = '';
  @Input() value = '0';
  @Input() icon = 'analytics';
  @Input() variant: 'primary' | 'success' | 'warning' | 'info' = 'primary';

}

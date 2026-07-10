import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  imports: [],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  readonly label   = input('');
  readonly value   = input('0');
  readonly icon    = input('analytics');
  readonly variant = input<'primary'|'success'|'warning'|'info'>('primary');
}

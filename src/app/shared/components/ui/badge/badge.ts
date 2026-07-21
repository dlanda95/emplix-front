import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-badge',
  imports: [NgClass],
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
})
export class Badge {
  readonly variant = input<'success'|'warning'|'error'|'neutral'|'primary'>('neutral');
}

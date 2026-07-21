import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  imports: [],
  templateUrl: './loading-skeleton.html',
  styleUrl: './loading-skeleton.scss',
})
export class LoadingSkeleton {
  readonly variant   = input<'text'|'card'|'avatar'|'stat'>('text');
  readonly lines     = input(3);
  readonly lineArray = computed(() => Array.from({ length: this.lines() }, (_, i) => i));
}

import { Component, computed, input } from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const PALETTES = [
  { bg: '#fce7f3', color: '#be185d' },
  { bg: '#dbeafe', color: '#1d4ed8' },
  { bg: '#d1fae5', color: '#065f46' },
  { bg: '#fef3c7', color: '#92400e' },
  { bg: '#ede9fe', color: '#6d28d9' },
  { bg: '#ffedd5', color: '#c2410c' },
  { bg: '#e0f2fe', color: '#0369a1' },
  { bg: '#fecaca', color: '#991b1b' },
];

@Component({
  selector: 'app-avatar',
  imports: [],
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
})
export class Avatar {
  readonly name = input.required<string>();
  readonly src  = input<string | undefined>(undefined);
  readonly size = input<AvatarSize>('md');

  readonly initials = computed(() =>
    this.name()
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('')
  );

  readonly palette = computed(() => {
    const idx = this.name().charCodeAt(0) % PALETTES.length;
    return PALETTES[idx];
  });
}

import { Component, input, output } from '@angular/core';

export interface FilterChipItem {
  id:     string;
  label:  string;
  icon?:  string;
  count?: number;
}

@Component({
  selector: 'app-filter-chips',
  templateUrl: './filter-chips.html',
  styleUrl: './filter-chips.scss',
})
export class FilterChips {
  readonly items  = input.required<FilterChipItem[]>();
  readonly active = input<string>('');

  readonly activeChange = output<string>();

  select(id: string): void {
    this.activeChange.emit(id);
  }
}

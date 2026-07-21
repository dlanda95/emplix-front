import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [],
  template: `
    @if (totalPages() > 1) {
      <div class="pagination">
        <button class="pagination__btn" [disabled]="page() <= 1" (click)="go(page() - 1)">
          <span class="material-icons-round">chevron_left</span>
        </button>

        @for (p of pages(); track p) {
          @if (p === -1) {
            <span class="pagination__ellipsis">…</span>
          } @else {
            <button
              class="pagination__btn"
              [class.pagination__btn--active]="p === page()"
              (click)="go(p)">
              {{ p }}
            </button>
          }
        }

        <button class="pagination__btn" [disabled]="page() >= totalPages()" (click)="go(page() + 1)">
          <span class="material-icons-round">chevron_right</span>
        </button>

        <span class="pagination__info">
          {{ (page() - 1) * pageSize() + 1 }}–{{ min(page() * pageSize(), total()) }} de {{ total() }}
        </span>
      </div>
    }
  `,
  styleUrl: './pagination.scss',
})
export class Pagination {
  readonly page       = input.required<number>();
  readonly total      = input.required<number>();
  readonly pageSize   = input<number>(25);
  readonly totalPages = computed(() => Math.ceil(this.total() / this.pageSize()));

  readonly pageChange = output<number>();

  readonly pages = computed(() => {
    const cur   = this.page();
    const total = this.totalPages();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const set = new Set([1, 2, cur - 1, cur, cur + 1, total - 1, total].filter(p => p >= 1 && p <= total));
    const sorted = [...set].sort((a, b) => a - b);
    const result: number[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(-1);
      result.push(sorted[i]);
    }
    return result;
  });

  go(p: number): void {
    if (p < 1 || p > this.totalPages() || p === this.page()) return;
    this.pageChange.emit(p);
  }

  min(a: number, b: number) { return Math.min(a, b); }
}

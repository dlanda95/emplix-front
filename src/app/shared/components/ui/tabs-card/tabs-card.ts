import {
  Component, EventEmitter, Input, Output,
  ViewChildren, ViewChild, QueryList, ElementRef,
  signal, afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TabItem {
  id:    string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-tabs-card',
  imports: [CommonModule],
  templateUrl: './tabs-card.html',
  styleUrl: './tabs-card.scss',
})
export class TabsCard {
  @Input({ required: true }) items:   TabItem[] = [];
  @Input()                   current: string    = '';
  @Input()                   align:   'start' | 'center' | 'fill' = 'start';
  @Output()                  currentChange = new EventEmitter<string>();

  @ViewChildren('tabBtn') tabButtons!: QueryList<ElementRef>;
  @ViewChild('navEl')     navEl!:      ElementRef<HTMLElement>;

  readonly indicatorLeft  = signal('0px');
  readonly indicatorWidth = signal('0px');
  readonly hasOverflow    = signal(false);

  constructor() {
    afterNextRender(() => {
      this.updateIndicator();
      this.checkOverflow();
    });
  }

  selectTab(id: string): void {
    this.current = id;
    this.currentChange.emit(id);
    queueMicrotask(() => this.updateIndicator());
  }

  onResize(): void {
    queueMicrotask(() => {
      this.updateIndicator();
      this.checkOverflow();
    });
  }

  checkOverflow(): void {
    const el = this.navEl?.nativeElement;
    if (!el) return;
    // Hay overflow si el contenido scrolleable supera el ancho visible
    // y además no estamos al final del scroll (aún hay más a la derecha)
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    this.hasOverflow.set(el.scrollWidth > el.clientWidth && !atEnd);
  }

  private updateIndicator(): void {
    if (!this.tabButtons) return;
    const buttons     = this.tabButtons.toArray();
    const activeIndex = this.items.findIndex(i => i.id === this.current);
    if (activeIndex !== -1 && buttons[activeIndex]) {
      const el = buttons[activeIndex].nativeElement;
      this.indicatorLeft.set(`${el.offsetLeft}px`);
      this.indicatorWidth.set(`${el.offsetWidth}px`);
    }
  }
}

import {
  Component, EventEmitter, Input, Output,
  ViewChildren, QueryList, ElementRef,
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

  // Signals → actualizaciones atómicas, sin NG0100
  readonly indicatorLeft  = signal('0px');
  readonly indicatorWidth = signal('0px');

  constructor() {
    // afterNextRender es el patrón correcto en Angular 20 zoneless
    // para leer medidas del DOM después del primer render
    afterNextRender(() => this.updateIndicator());
  }

  selectTab(id: string): void {
    this.current = id;
    this.currentChange.emit(id);
    // queueMicrotask mantiene la lectura fuera del ciclo de detección actual
    queueMicrotask(() => this.updateIndicator());
  }

  onResize(): void {
    queueMicrotask(() => this.updateIndicator());
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

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
      this.equalizeAndUpdate();
    });
  }

  selectTab(id: string): void {
    this.current = id;
    this.currentChange.emit(id);
    queueMicrotask(() => this.updateIndicator());
  }

  onResize(): void {
    queueMicrotask(() => this.equalizeAndUpdate());
  }

  checkOverflow(): void {
    const el = this.navEl?.nativeElement;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    this.hasOverflow.set(el.scrollWidth > el.clientWidth && !atEnd);
  }

  private equalizeAndUpdate(): void {
    this.equalizeTabWidths();
    this.updateIndicator();
    this.checkOverflow();
  }

  // Aplica el mismo ancho a todos los tabs: el mayor entre el ancho natural
  // máximo y lo que corresponde si se reparte el espacio disponible del nav.
  // Así los tabs son simétricos y hacen scroll si no caben.
  private equalizeTabWidths(): void {
    const buttons = this.tabButtons?.toArray();
    const nav     = this.navEl?.nativeElement;
    if (!buttons?.length || !nav) return;

    // 1. Resetear widths para medir el ancho natural de cada tab
    buttons.forEach(b => (b.nativeElement.style.width = ''));

    // 2. Ancho natural máximo entre todos los botones
    const maxNatural = Math.max(
      ...buttons.map(b => (b.nativeElement as HTMLElement).getBoundingClientRect().width)
    );

    // 3. Ancho si se reparte el espacio del nav equitativamente
    //    (padding lateral ≈ 1.75rem * 2 = 56px)
    const navPad      = parseFloat(getComputedStyle(nav).paddingLeft) * 2;
    const evenWidth   = (nav.clientWidth - navPad) / buttons.length;

    // 4. Usar el mayor de los dos para que quepan los labels más largos
    const finalWidth  = Math.ceil(Math.max(maxNatural, evenWidth));

    buttons.forEach(b => (b.nativeElement.style.width = `${finalWidth}px`));
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

import {
  Component, ViewChildren, ViewChild, QueryList, ElementRef,
  afterNextRender, effect, input, output, signal,
} from '@angular/core';
import { NgClass } from '@angular/common';

export interface TabItem {
  id:    string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-tabs-card',
  imports: [NgClass],
  templateUrl: './tabs-card.html',
  styleUrl: './tabs-card.scss',
})
export class TabsCard {
  readonly items         = input.required<TabItem[]>();
  readonly current       = input<string>('');
  readonly align         = input<'start'|'center'|'fill'>('start');
  readonly currentChange = output<string>();

  @ViewChildren('tabBtn') tabButtons!: QueryList<ElementRef>;
  @ViewChild('navEl')     navEl!:      ElementRef<HTMLElement>;

  readonly indicatorLeft  = signal('0px');
  readonly indicatorWidth = signal('0px');
  readonly hasOverflow    = signal(false);
  private  _activeTab     = signal('');

  constructor() {
    effect(() => { this._activeTab.set(this.current()); });
    afterNextRender(() => { this.equalizeAndUpdate(); });
  }

  selectTab(id: string): void {
    this._activeTab.set(id);
    this.currentChange.emit(id);
    queueMicrotask(() => this.updateIndicator());
  }

  isActive(id: string): boolean {
    return this._activeTab() === id;
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

  private equalizeTabWidths(): void {
    const buttons = this.tabButtons?.toArray();
    const nav     = this.navEl?.nativeElement;
    if (!buttons?.length || !nav) return;

    buttons.forEach(b => (b.nativeElement.style.width = ''));

    const maxNatural = Math.max(
      ...buttons.map(b => (b.nativeElement as HTMLElement).getBoundingClientRect().width)
    );

    const navPad    = parseFloat(getComputedStyle(nav).paddingLeft) * 2;
    const evenWidth = (nav.clientWidth - navPad) / buttons.length;
    const finalWidth = Math.ceil(Math.max(maxNatural, evenWidth));

    buttons.forEach(b => (b.nativeElement.style.width = `${finalWidth}px`));
  }

  private updateIndicator(): void {
    if (!this.tabButtons) return;
    const buttons     = this.tabButtons.toArray();
    const activeIndex = this.items().findIndex(i => i.id === this._activeTab());
    if (activeIndex !== -1 && buttons[activeIndex]) {
      const el = buttons[activeIndex].nativeElement;
      this.indicatorLeft.set(`${el.offsetLeft}px`);
      this.indicatorWidth.set(`${el.offsetWidth}px`);
    }
  }
}

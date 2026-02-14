import { Component, EventEmitter, Input, Output, ViewChildren, QueryList, ElementRef, AfterViewInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfaz opcional si quieres iconos
export interface TabItem {
  id: string;
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
@Input({ required: true }) items: TabItem[] = [];
  @Input() current: string = '';
  @Input() align: 'start' | 'center' | 'fill' = 'start';
  @Output() currentChange = new EventEmitter<string>();

  // 🔥 Referencia a todos los botones para medir su ancho/posición
  @ViewChildren('tabBtn') tabButtons!: QueryList<ElementRef>;

  // Variables para la animación de la línea (Signals o normales)
  indicatorLeft = '0px';
  indicatorWidth = '0px';

  ngAfterViewInit() {
    // Un pequeño timeout para asegurar que el DOM esté pintado
    setTimeout(() => this.updateIndicator(), 0);
  }

  selectTab(id: string) {
    this.current = id;
    this.currentChange.emit(id);
    this.updateIndicator();
  }

  // 🪄 LA MAGIA: Calcula posición y ancho de la línea deslizante
  private updateIndicator() {
    if (!this.tabButtons) return;

    const buttons = this.tabButtons.toArray();
    const activeIndex = this.items.findIndex(item => item.id === this.current);
    
    if (activeIndex !== -1 && buttons[activeIndex]) {
      const element = buttons[activeIndex].nativeElement;
      this.indicatorLeft = `${element.offsetLeft}px`;
      this.indicatorWidth = `${element.offsetWidth}px`;
    }
  }
  
  // Opcional: Recalcular al redimensionar la ventana
  onResize() {
    this.updateIndicator();
  }
}


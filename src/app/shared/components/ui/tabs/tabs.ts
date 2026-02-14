import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';



// Interfaz opcional si quieres iconos
export interface TabItem {
  id: string;
  label: string;
  icon?: string;
}


@Component({
  selector: 'app-tabs',
  imports: [CommonModule],
  templateUrl: './tabs.html',
  styleUrl: './tabs.scss',
})
export class Tabs {


  @Input({ required: true }) items: TabItem[] = [];
  @Input() current: string = '';
  @Output() currentChange = new EventEmitter<string>();

  selectTab(id: string) {
    this.current = id;
    this.currentChange.emit(id);
  }

}

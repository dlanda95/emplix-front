import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';


export interface CardHeaderConfig {
  title: string;
  subtitle?: string;
  version?: string;
  icon?: string;
  // Permite cambiar el color del header dinámicamente
  variant?: 'primary' | 'info' | 'success' | 'warning'; 
}

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './app-card.html',
  styleUrl: './app-card.scss',
})
export class AppCard {

  @Input({ required: true }) config!: CardHeaderConfig;

}

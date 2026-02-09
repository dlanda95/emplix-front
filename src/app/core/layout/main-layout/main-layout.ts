import { Component,inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar'; // 🔥 Importar
import { Topbar } from '../topbar/topbar';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../services/layout';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, CommonModule,Sidebar,Topbar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  layoutService = inject(LayoutService);
  
  // Getter para usar el signal en el HTML fácilmente
 // Signal directo
  sidebarOpen = this.layoutService.sidebarOpen;


closeMobileSidebar() {
    this.layoutService.closeSidebar();
  }

}

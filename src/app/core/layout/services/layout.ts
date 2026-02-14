import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  

  
  // ==========================================================
  // 1. ESTADO MÓVIL (Overlay: Visible / Oculto)
  // ==========================================================
  // Controla si el sidebar aparece encima del contenido en celulares
  private _mobileMenuOpen = signal<boolean>(false);
  mobileMenuOpen = this._mobileMenuOpen.asReadonly();

  toggleMobileMenu() {
    this._mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this._mobileMenuOpen.set(false);
  }

  // ==========================================================
  // 2. ESTADO DESKTOP (Mini / Expandido)
  // ==========================================================
  // Controla si el sidebar está "flaco" (80px) o "ancho" (260px)
  private _isSidebarCollapsed = signal<boolean>(false);
  isSidebarCollapsed = this._isSidebarCollapsed.asReadonly();

  // Acción del botón hamburguesa en Desktop
  toggleSidebar() {
    this._isSidebarCollapsed.update(value => !value);
  }

  // 🔥 MÉTODO FALTANTE (Necesario para tu SidebarComponent)
  // Se llama automáticamente cuando la pantalla se hace pequeña
  collapseSidebar() {
    this._isSidebarCollapsed.set(true);
  }

  // Se llama cuando intentas abrir un submenú estando colapsado
  expandSidebar() {
    this._isSidebarCollapsed.set(false);
  }
}
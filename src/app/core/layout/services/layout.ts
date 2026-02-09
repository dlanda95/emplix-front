import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  
  // ✅ STATE (Usamos Signals para reactividad instantánea)
  // false por defecto para móvil (cerrado)
  private _sidebarOpen = signal<boolean>(false);

  // Exponemos el signal como solo lectura para quien lo consuma
  sidebarOpen = this._sidebarOpen.asReadonly();

  toggleSidebar() {
    this._sidebarOpen.update(value => !value);
  }

  closeSidebar() {
    this._sidebarOpen.set(false);
  }

  openSidebar() {
    this._sidebarOpen.set(true);
  }
}
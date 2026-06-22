import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly _mobileMenuOpen     = signal(false);
  private readonly _isSidebarCollapsed = signal(false);

  readonly mobileMenuOpen     = this._mobileMenuOpen.asReadonly();
  readonly isSidebarCollapsed = this._isSidebarCollapsed.asReadonly();

  toggleMobileMenu():  void { this._mobileMenuOpen.update(v => !v); }
  closeMobileMenu():   void { this._mobileMenuOpen.set(false); }
  toggleSidebar():     void { this._isSidebarCollapsed.update(v => !v); }
  collapseSidebar():   void { this._isSidebarCollapsed.set(true); }
  expandSidebar():     void { this._isSidebarCollapsed.set(false); }
}

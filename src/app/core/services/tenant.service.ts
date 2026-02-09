import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TenantService {
  // Inicializamos leyendo de localStorage para no perder el dato al recargar
  private _tenant = signal<string | null>(localStorage.getItem('saved_tenant'));
  tenant = this._tenant.asReadonly();

  setTenant(slug: string) {
    // Normalizamos a minúsculas para evitar errores (TechGans -> techgans)
    const cleanSlug = slug.toLowerCase().trim();
    
    this._tenant.set(cleanSlug);
    localStorage.setItem('saved_tenant', cleanSlug);
  }

  getTenant(): string | null {
    return this._tenant();
  }
  
  clearTenant() {
    // Opcional: si quieres permitir 'cerrar sesión de empresa'
    this._tenant.set(null);
    localStorage.removeItem('saved_tenant');
  }



}

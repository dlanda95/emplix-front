import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly _tenant = signal<string | null>(localStorage.getItem('saved_tenant'));
  readonly tenant = this._tenant.asReadonly();

  setTenant(slug: string): void {
    const clean = slug.toLowerCase().trim();
    this._tenant.set(clean);
    localStorage.setItem('saved_tenant', clean);
  }

  getTenant(): string | null {
    return this._tenant();
  }

  clearTenant(): void {
    this._tenant.set(null);
    localStorage.removeItem('saved_tenant');
  }
}

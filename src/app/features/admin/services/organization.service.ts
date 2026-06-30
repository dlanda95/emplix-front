import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env';

const BASE = `${environment.apiUrl}/organization`;

// ── Tipos ───────────────────────────────────────────────────────────────────

export type AreaType = 'TRANSVERSAL' | 'EMISSIVE' | 'RECEPTIVE';
export type RoleType = 'OPERATIONAL' | 'TACTICAL' | 'STRATEGIC';

export const AREA_TYPE_LABELS: Record<AreaType, string> = {
  TRANSVERSAL: 'Transversal',
  EMISSIVE:    'Emisiva',
  RECEPTIVE:   'Receptiva',
};

export const AREA_TYPE_VARIANTS: Record<AreaType, string> = {
  TRANSVERSAL: 'neutral',
  EMISSIVE:    'success',
  RECEPTIVE:   'info',
};

export const ROLE_TYPE_LABELS: Record<RoleType, string> = {
  OPERATIONAL: 'Operativo',
  TACTICAL:    'Táctico',
  STRATEGIC:   'Estratégico',
};

export interface Subarea {
  id:          string;
  name:        string;
  description: string | null;
  areaType:    AreaType;
  isActive:    boolean;
  parentId:    string;
  _count:      { employees: number; positions: number };
}

export interface Area {
  id:          string;
  name:        string;
  code:        string | null;
  description: string | null;
  areaType:    AreaType;
  isActive:    boolean;
  parentId:    null;
  children:    Subarea[];
  positions:   AreaPosition[];
  _count:      { employees: number; children: number; positions: number };
}

export interface AreaPosition {
  id:            string;
  name:          string;
  hierarchyLevel:number;
  roleType:      RoleType;
  isActive:      boolean;
}

export interface Position {
  id:             string;
  name:           string;
  description:    string | null;
  hierarchyLevel: number;
  roleType:       RoleType;
  isActive:       boolean;
  departmentId:   string | null;
  department:     { id: string; name: string; parentId: string | null } | null;
  _count:         { employees: number };
}

// ── Payloads ────────────────────────────────────────────────────────────────

export interface AreaPayload {
  name:        string;
  description?: string;
  code?:       string | null;
  areaType?:   AreaType;
  isActive?:   boolean;
}

export interface PositionPayload {
  name:            string;
  description?:    string;
  departmentId?:   string | null;
  hierarchyLevel?: number;
  roleType?:       RoleType;
  isActive?:       boolean;
}

// ── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class OrganizationAdminService {
  private readonly http = inject(HttpClient);

  // Áreas
  getAreas(includeInactive = false): Observable<Area[]> {
    return this.http
      .get<any>(`${BASE}/areas`, { params: includeInactive ? { includeInactive: 'true' } : {} })
      .pipe(map(r => r?.data ?? r));
  }

  createArea(payload: AreaPayload): Observable<Area> {
    return this.http.post<any>(`${BASE}/areas`, payload).pipe(map(r => r?.data ?? r));
  }

  updateArea(id: string, payload: Partial<AreaPayload>): Observable<Area> {
    return this.http.put<any>(`${BASE}/areas/${id}`, payload).pipe(map(r => r?.data ?? r));
  }

  deleteArea(id: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/areas/${id}`);
  }

  // Subáreas
  createSubarea(parentId: string, payload: AreaPayload): Observable<Subarea> {
    return this.http.post<any>(`${BASE}/areas/${parentId}/subareas`, payload).pipe(map(r => r?.data ?? r));
  }

  updateSubarea(id: string, payload: Partial<AreaPayload>): Observable<Subarea> {
    return this.http.put<any>(`${BASE}/areas/${id}`, payload).pipe(map(r => r?.data ?? r));
  }

  deleteSubarea(id: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/areas/${id}`);
  }

  // Cargos
  getPositions(includeInactive = false): Observable<Position[]> {
    return this.http
      .get<any>(`${BASE}/positions`, { params: includeInactive ? { includeInactive: 'true' } : {} })
      .pipe(map(r => r?.data ?? r));
  }

  createPosition(payload: PositionPayload): Observable<Position> {
    return this.http.post<any>(`${BASE}/positions`, payload).pipe(map(r => r?.data ?? r));
  }

  updatePosition(id: string, payload: Partial<PositionPayload>): Observable<Position> {
    return this.http.put<any>(`${BASE}/positions/${id}`, payload).pipe(map(r => r?.data ?? r));
  }

  deletePosition(id: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/positions/${id}`);
  }
}

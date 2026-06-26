import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env';
import { CollaboratorProfile } from '@features/portal/models/collaborator.model';

export type DocState = 'idle' | 'uploading' | 'done' | 'error';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly http     = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/onboarding`;

  readonly profile = signal<CollaboratorProfile | null>(null);

  // ── Paso guardado / dirty ────────────────────────────────────────────────────
  private readonly _savedSteps = signal<Set<string>>(new Set());
  private readonly _dirtySteps = signal<Set<string>>(new Set());

  readonly savedSteps = this._savedSteps.asReadonly();

  markSaved(stepPath: string): void {
    this._savedSteps.update(s => new Set([...s, stepPath]));
    this.clearDirty(stepPath);
  }

  isStepSaved(stepPath: string): boolean {
    return this._savedSteps().has(stepPath);
  }

  markDirty(stepPath: string): void {
    this._dirtySteps.update(s => new Set([...s, stepPath]));
  }

  clearDirty(stepPath: string): void {
    this._dirtySteps.update(s => { const n = new Set(s); n.delete(stepPath); return n; });
  }

  isDirty(stepPath: string): boolean {
    return this._dirtySteps().has(stepPath);
  }

  // ── Estado de documentos (persiste entre destroy/recreate del componente) ─────
  private readonly _docStates = signal<Record<string, DocState>>({
    identity: 'idle', cv: 'idle', receipt: 'idle',
  });
  private readonly _docNames = signal<Record<string, string>>({});

  readonly docStates = this._docStates.asReadonly();
  readonly docNames  = this._docNames.asReadonly();

  docStateOf(key: string): DocState { return this._docStates()[key] ?? 'idle'; }

  setDocState(key: string, state: DocState): void {
    this._docStates.update(m => ({ ...m, [key]: state }));
  }
  setDocName(key: string, name: string): void {
    this._docNames.update(m => ({ ...m, [key]: name }));
  }
  clearDocName(key: string): void {
    this._docNames.update(m => { const n = { ...m }; delete n[key]; return n; });
  }

  // ── Borradores en memoria (preservar datos no guardados entre tabs) ───────────
  private readonly drafts = new Map<string, Record<string, unknown>>();

  setDraft(stepKey: string, data: Record<string, unknown>): void {
    this.drafts.set(stepKey, data);
  }

  getDraft(stepKey: string): Record<string, unknown> | undefined {
    return this.drafts.get(stepKey);
  }

  // ── HTTP ─────────────────────────────────────────────────────────────────────
  loadProfile(): Observable<CollaboratorProfile> {
    return this.http.get<any>(`${this.endpoint}/profile`).pipe(
      map(res => (res?.data ?? res) as CollaboratorProfile),
      tap(p => {
        this.profile.set(p);
        this.autoMarkFromProfile(p);
      }),
    );
  }

  saveData(data: Record<string, unknown>): Observable<CollaboratorProfile> {
    return this.http.patch<any>(`${this.endpoint}/data`, data).pipe(
      map(res => (res?.data ?? res) as CollaboratorProfile),
      tap(p => this.profile.set(p)),
    );
  }

  submit(): Observable<void> {
    return this.http.post<any>(`${this.endpoint}/submit`, {}).pipe(map(() => undefined));
  }

  // ── Detectar pasos ya guardados en el servidor ───────────────────────────────
  private autoMarkFromProfile(p: CollaboratorProfile): void {
    if (p.firstName)                      this.markSaved('identidad');
    if (p.address)                        this.markSaved('residencia');
    if (p.cellPhone || p.personalEmail)   this.markSaved('contacto');
    if (p.afpType   || p.bankEntity)      this.markSaved('financiero');
    this.markSaved('familia'); // placeholder, sin datos obligatorios
  }
}

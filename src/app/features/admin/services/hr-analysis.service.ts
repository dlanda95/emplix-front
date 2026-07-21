import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env';

export type HRRecommendation = 'PENDING' | 'APPROVED' | 'CONDITIONALLY_APPROVED' | 'REJECTED';

export interface HRAnalysisDoc {
  id:          string;
  name:        string;
  originalName: string;
  mimeType:    string;
  size:        number;
  createdAt:   string;
}

export interface HRAnalysis {
  id:                   string;
  selectionProcessId:   string;
  candidateId:          string;
  professionalSummary:  string | null;
  strengths:            string | null;
  improvementAreas:     string | null;
  interviewResults:     string | null;
  competencyEvaluation: string | null;
  identifiedRisks:      string | null;
  recommendation:       HRRecommendation;
  recommendationNotes:  string | null;
  salaryExpectation:    number | null;
  createdByName:        string | null;
  documents:            HRAnalysisDoc[];
  updatedAt:            string;
}

export interface UpsertHRAnalysisPayload {
  professionalSummary?:  string | null;
  strengths?:            string | null;
  improvementAreas?:     string | null;
  interviewResults?:     string | null;
  competencyEvaluation?: string | null;
  identifiedRisks?:      string | null;
  recommendation?:       HRRecommendation;
  recommendationNotes?:  string | null;
  salaryExpectation?:    number | null;
}

@Injectable({ providedIn: 'root' })
export class HRAnalysisService {
  private readonly http = inject(HttpClient);

  private base(processId: string, candidateId: string): string {
    return `${environment.apiUrl}/selection-processes/${processId}/candidates/${candidateId}/hr-analysis`;
  }

  get(processId: string, candidateId: string): Observable<HRAnalysis | null> {
    return this.http.get<HRAnalysis | null>(this.base(processId, candidateId));
  }

  getForProcess(processId: string): Observable<HRAnalysis[]> {
    return this.http.get<HRAnalysis[]>(`${environment.apiUrl}/selection-processes/${processId}/hr-analyses`);
  }

  upsert(processId: string, candidateId: string, payload: UpsertHRAnalysisPayload): Observable<HRAnalysis> {
    return this.http.put<HRAnalysis>(this.base(processId, candidateId), payload);
  }

  uploadDocument(processId: string, candidateId: string, file: File): Observable<HRAnalysisDoc> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post<HRAnalysisDoc>(`${this.base(processId, candidateId)}/documents`, fd);
  }

  deleteDocument(processId: string, candidateId: string, docId: string): Observable<void> {
    return this.http.delete<void>(`${this.base(processId, candidateId)}/documents/${docId}`);
  }

  getDocumentUrl(processId: string, candidateId: string, docId: string): Observable<string> {
    return this.http
      .get<{ url: string }>(`${this.base(processId, candidateId)}/documents/${docId}/url`)
      .pipe(map(r => r.url));
  }
}

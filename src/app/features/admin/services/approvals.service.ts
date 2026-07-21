import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';
import type { SelectionProcess } from './selection-processes.service';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ApproverType   = 'APPROVER' | 'HR';

export interface ApprovalLineItem {
  approverId:    string;
  approverType:  ApproverType;
  approverName:  string;
  approverRole:  string | null;
  order:         number | null;
  status:        ApprovalStatus;
  comment:       string | null;
  decidedAt:     string | null;
  isCurrentUser: boolean;
}

export interface CandidateBasic {
  id:              string;
  firstName:       string;
  lastName:        string;
  middleName?:     string | null;
  secondLastName?: string | null;
  documentType?:   string | null;
  documentId?:     string | null;
  personalEmail?:  string | null;
  phone?:          string | null;
  cellPhone?:      string | null;
  hireDate:        string;
  status:          string;
  onboardingStatus?: string | null;
  position?:   { name: string } | null;
  department?: { name: string } | null;
}

export interface HrApprovalRecord {
  approverId:   string;
  approverName: string;
  status:       ApprovalStatus;
  comment:      string | null;
  decidedAt:    string | null;
}

export interface CandidateApprovalsResponse {
  candidate:      CandidateBasic;
  approverLines:  ApprovalLineItem[];
  hrLine:         ApprovalLineItem | null;
  hrApprovals:    HrApprovalRecord[];
  fullyApproved:  boolean;
  anyRejected:    boolean;
  totalApprovers: number;
  approvedCount:  number;
}

export interface SubmitApprovalPayload {
  status:   'APPROVED' | 'REJECTED';
  comment?: string;
}

export interface ApprovalSummary {
  approved:    number;
  total:       number;
  hrApproved:  boolean;
  anyRejected: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApprovalsService {
  private readonly http     = inject(HttpClient);
  private readonly base     = `${environment.apiUrl}/selection-processes`;

  getCandidateApprovals(processId: string, candidateId: string): Observable<CandidateApprovalsResponse> {
    return this.http.get<CandidateApprovalsResponse>(
      `${this.base}/${processId}/candidates/${candidateId}/approvals`,
    );
  }

  submitApproval(processId: string, candidateId: string, payload: SubmitApprovalPayload): Observable<unknown> {
    return this.http.post(
      `${this.base}/${processId}/candidates/${candidateId}/approve`,
      payload,
    );
  }

  convertToEmployee(processId: string, candidateId: string, corporateEmail: string): Observable<{ emailSent: boolean; emailError?: string; deliveryEmail?: string }> {
    return this.http.post<{ emailSent: boolean; emailError?: string; deliveryEmail?: string }>(
      `${this.base}/${processId}/candidates/${candidateId}/convert`,
      { corporateEmail },
    );
  }

  listMyProcesses(): Observable<{ data: SelectionProcess[]; total: number }> {
    return this.http.get<{ data: SelectionProcess[]; total: number }>(
      `${this.base}/my-processes`,
    );
  }
}

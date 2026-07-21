import { Component, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AppTextarea } from '../app-textarea/app-textarea';
import { Banner }  from '../banner/banner';
import { Button }  from '../button/button';
import {
  CandidateApprovalsResponse, ApprovalLineItem,
} from '@features/admin/services/approvals.service';

@Component({
  selector: 'app-candidate-approval-panel',
  imports: [CommonModule, ReactiveFormsModule, AppTextarea, Banner, Button],
  templateUrl: './candidate-approval-panel.html',
  styleUrl: './candidate-approval-panel.scss',
  host: { style: 'display:block' },
})
export class CandidateApprovalPanel {
  readonly data          = input<CandidateApprovalsResponse | null>(null);
  readonly isHRUser      = input<boolean>(false);
  readonly isSubmitting  = input<boolean>(false);
  readonly isConverting  = input<boolean>(false);
  readonly convertError  = input<string>('');

  readonly voted            = output<{ status: 'APPROVED' | 'REJECTED'; comment: string | null }>();
  readonly convertRequested = output<void>();

  readonly commentCtrl = new FormControl<string>('');
  readonly isEditing   = signal(false);

  constructor() {
    effect(() => {
      // Reset editing state when data reloads (e.g., after a successful vote)
      this.data();
      this.isEditing.set(false);
      this.commentCtrl.reset('');
    });
  }

  canApproveAsApprover(): boolean {
    return this.data()?.approverLines.some(l => l.isCurrentUser) ?? false;
  }

  myApprovalLine(): ApprovalLineItem | null {
    return this.data()?.approverLines.find(l => l.isCurrentUser) ?? null;
  }

  startEdit(comment?: string | null): void {
    this.commentCtrl.setValue(comment ?? '');
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.commentCtrl.reset('');
    this.isEditing.set(false);
  }

  vote(status: 'APPROVED' | 'REJECTED'): void {
    this.voted.emit({ status, comment: this.commentCtrl.value?.trim() || null });
  }
}

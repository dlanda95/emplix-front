import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CollaboratorService } from '@features/portal/services/collaborator.service';
import { TimelineItem, LoadingSkeleton, EmptyState } from '@shared/ui';

@Component({
  selector: 'app-historico',
  imports: [TimelineItem, LoadingSkeleton, EmptyState],
  templateUrl: './historico.html',
  styleUrl: './historico.scss',
})
export class Historico {
  private readonly collaboratorService = inject(CollaboratorService);

  readonly history = toSignal(this.collaboratorService.getEmploymentHistory());
  readonly isLoading = !this.history;
}

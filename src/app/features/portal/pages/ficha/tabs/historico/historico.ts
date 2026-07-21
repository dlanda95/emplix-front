import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CollaboratorService } from '@features/portal/services/collaborator.service';
import { TimelineItem, LoadingSkeleton, EmptyState, PortalTabLayout, PageHeader } from '@shared/ui';

@Component({
  selector: 'app-historico',
  imports: [TimelineItem, LoadingSkeleton, EmptyState, PortalTabLayout, PageHeader],
  templateUrl: './historico.html',
  host: { style: 'display:block; height:100%' },
})
export class Historico {
  private readonly collaboratorService = inject(CollaboratorService);

  readonly history = toSignal(this.collaboratorService.getEmploymentHistory());
  readonly isLoading = !this.history;
}

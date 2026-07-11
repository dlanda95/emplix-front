import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { AppCard, type CardHeaderConfig } from '@shared/ui';
import { SidebarLayout, type SidebarLayoutItem } from '@shared/layout';
import { CollaboratorService } from '@features/portal/services/collaborator.service';

@Component({
  selector: 'app-ficha',
  imports: [RouterOutlet, AppCard, SidebarLayout],
  templateUrl: './ficha.html',
})
export class Ficha implements OnInit {
  private readonly collaboratorService = inject(CollaboratorService);
  private readonly destroyRef          = inject(DestroyRef);

  readonly headerData = signal<CardHeaderConfig>({
    title:    'Mi Legajo',
    subtitle: 'PORTAL DEL COLABORADOR',
    version:  'Versión 2.0',
    icon:     'folder_shared',
    variant:  'primary',
  });

  readonly menuData: SidebarLayoutItem[] = [
    { label: 'Información General', icon: 'person',      route: 'general',    exact: true },
    { label: 'Histórico Laboral',   icon: 'history',     route: 'historico'               },
    { label: 'Documentos',          icon: 'description', route: 'documentos'              },
  ];

  ngOnInit(): void {
    this.collaboratorService.getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: profile => this.headerData.set({
          ...this.headerData(),
          title: `${profile.firstName} ${profile.lastName}`,
        }),
      });
  }
}

import { Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Field } from '../../../../../../../../shared/components/ui/field/field';
import { SectionCard } from '../../../../../../../../shared/components/ui/section-card/section-card';
import { MapWidget } from '../../../../../../../../shared/components/ui/map-widget/map-widget';
import { toSignal } from '@angular/core/rxjs-interop';
import { SplitLayout } from '../../../../../../../../shared/components/ui/split-layout/split-layout';
import { map } from 'rxjs';


import { CollaboratorService} from '../../../../../../core/services/collaborator.service';



@Component({
  selector: 'app-direccion',
  imports: [CommonModule, SectionCard,Field,SplitLayout,MapWidget],
  templateUrl: './direccion.html',
  styleUrl: './direccion.scss',
})
export class Direccion {
  private collaboratorService = inject(CollaboratorService);
  // Reutilizamos el mismo servicio. 
  // Angular HTTP Client usa caché por defecto en peticiones GET idénticas si se configuran, 
  // o simplemente es una llamada muy rápida.
  profile = toSignal(this.collaboratorService.getProfile());

}

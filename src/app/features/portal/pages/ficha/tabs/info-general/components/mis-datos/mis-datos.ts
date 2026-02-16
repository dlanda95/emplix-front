import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importamos tus UI Kits Globales

import { Field } from '../../../../../../../../shared/components/ui/field/field';
import { SectionCard } from '../../../../../../../../shared/components/ui/section-card/section-card';
 import { SplitLayout } from '../../../../../../../../shared/components/ui/split-layout/split-layout';
import { Badge } from '../../../../../../../../shared/components/ui/badge/badge';

@Component({
  selector: 'app-mis-datos',
  imports: [CommonModule, Badge, SplitLayout,SectionCard, Field],
  templateUrl: './mis-datos.html',
  styleUrl: './mis-datos.scss',
})
export class MisDatos {

}

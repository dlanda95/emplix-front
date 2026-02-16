import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Field } from '../../../../../../../../shared/components/ui/field/field';
import { SectionCard } from '../../../../../../../../shared/components/ui/section-card/section-card';
import { MapWidget } from '../../../../../../../../shared/components/ui/map-widget/map-widget';

import { SplitLayout } from '../../../../../../../../shared/components/ui/split-layout/split-layout';
import { map } from 'rxjs';
@Component({
  selector: 'app-direccion',
  imports: [CommonModule, SectionCard,Field,SplitLayout,MapWidget],
  templateUrl: './direccion.html',
  styleUrl: './direccion.scss',
})
export class Direccion {

}

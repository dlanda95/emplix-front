import { Pipe, PipeTransform } from '@angular/core';
import type { SelectionProcessStatus } from '../services/selection-processes.service';

type BadgeVariant = 'success' | 'warning' | 'neutral' | 'error';

const STATUS_LABELS: Record<SelectionProcessStatus, string> = {
  OPEN:      'Activo',
  CLOSED:    'Cerrado',
  CANCELLED: 'Cancelado',
};

const STATUS_VARIANTS: Record<SelectionProcessStatus, BadgeVariant> = {
  OPEN:      'success',
  CLOSED:    'neutral',
  CANCELLED: 'error',
};

@Pipe({ name: 'spStatusLabel', standalone: true })
export class SelectionProcessStatusLabelPipe implements PipeTransform {
  transform(status: string | null | undefined): string {
    return STATUS_LABELS[(status as SelectionProcessStatus)] ?? status ?? '—';
  }
}

@Pipe({ name: 'spStatusVariant', standalone: true })
export class SelectionProcessStatusVariantPipe implements PipeTransform {
  transform(status: string | null | undefined): BadgeVariant {
    return STATUS_VARIANTS[(status as SelectionProcessStatus)] ?? 'neutral';
  }
}

// Barrel para importar ambos con un solo símbolo
export { SelectionProcessStatusLabelPipe as SelectionProcessStatusPipe };

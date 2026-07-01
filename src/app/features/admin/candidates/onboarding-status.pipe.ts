import { Pipe, PipeTransform } from '@angular/core';

const LABELS: Record<string, string> = {
  DOCS_SUBMITTED: 'Docs. Enviados',
  COMPLETED:      'Completado',
};

const VARIANTS: Record<string, 'success' | 'warning' | 'neutral'> = {
  DOCS_SUBMITTED: 'success',
  COMPLETED:      'neutral',
};

@Pipe({ name: 'onboardingLabel', pure: true })
export class OnboardingLabelPipe implements PipeTransform {
  transform(val: string | null | undefined): string {
    return LABELS[val ?? ''] ?? 'Pendiente de docs.';
  }
}

@Pipe({ name: 'onboardingVariant', pure: true })
export class OnboardingVariantPipe implements PipeTransform {
  transform(val: string | null | undefined): 'success' | 'warning' | 'neutral' {
    return VARIANTS[val ?? ''] ?? 'warning';
  }
}

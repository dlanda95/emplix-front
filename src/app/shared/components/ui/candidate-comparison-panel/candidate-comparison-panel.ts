import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyState } from '../empty-state/empty-state';
import { CandidateSummary } from '@features/admin/services/candidates.service';
import { HRAnalysis, HRRecommendation } from '@features/admin/services/hr-analysis.service';

export interface ComparisonRow {
  candidate: CandidateSummary;
  analysis:  HRAnalysis | null;
}

const SECTIONS: { key: keyof HRAnalysis; label: string; icon: string }[] = [
  { key: 'professionalSummary',  label: 'Resumen profesional',        icon: 'person'            },
  { key: 'strengths',            label: 'Fortalezas',                 icon: 'thumb_up'          },
  { key: 'improvementAreas',     label: 'Áreas de mejora',            icon: 'trending_up'       },
  { key: 'interviewResults',     label: 'Resultados de entrevistas',  icon: 'record_voice_over' },
  { key: 'competencyEvaluation', label: 'Evaluación de competencias', icon: 'psychology'        },
  { key: 'identifiedRisks',      label: 'Riesgos identificados',      icon: 'warning'           },
];

const REC_META: Record<HRRecommendation, { label: string; icon: string; cls: string }> = {
  APPROVED:               { label: 'Recomendado',       icon: 'verified',        cls: 'success'  },
  CONDITIONALLY_APPROVED: { label: 'Con condiciones',   icon: 'info',            cls: 'info'     },
  REJECTED:               { label: 'No recomendado',    icon: 'cancel',          cls: 'error'    },
  PENDING:                { label: 'Sin análisis',       icon: 'hourglass_empty', cls: 'neutral'  },
};

@Component({
  selector: 'app-candidate-comparison-panel',
  imports: [CommonModule, EmptyState],
  templateUrl: './candidate-comparison-panel.html',
  host: { style: 'display:block' },
})
export class CandidateComparisonPanel {
  readonly candidates = input<CandidateSummary[]>([]);
  readonly analyses   = input<HRAnalysis[]>([]);

  readonly sections = SECTIONS;
  readonly recMeta  = REC_META;

  readonly rows = computed<ComparisonRow[]>(() =>
    this.candidates().map(c => ({
      candidate: c,
      analysis:  this.analyses().find(a => a.candidateId === c.id) ?? null,
    }))
  );

  readonly stats = computed(() => {
    const recs = this.rows().map(r => r.analysis?.recommendation ?? 'PENDING');
    return [
      { key: 'APPROVED',               count: recs.filter(r => r === 'APPROVED').length,               ...REC_META['APPROVED']               },
      { key: 'CONDITIONALLY_APPROVED', count: recs.filter(r => r === 'CONDITIONALLY_APPROVED').length, ...REC_META['CONDITIONALLY_APPROVED'] },
      { key: 'REJECTED',               count: recs.filter(r => r === 'REJECTED').length,               ...REC_META['REJECTED']               },
      { key: 'PENDING',                count: recs.filter(r => r === 'PENDING').length,                ...REC_META['PENDING']                },
    ].filter(s => s.count > 0);
  });

  initials(c: CandidateSummary): string {
    return `${c.firstName[0] ?? ''}${c.lastName[0] ?? ''}`.toUpperCase();
  }

  rec(row: ComparisonRow): HRRecommendation {
    return row.analysis?.recommendation ?? 'PENDING';
  }

  cellValue(row: ComparisonRow, key: keyof HRAnalysis): string {
    return (row.analysis as any)?.[key] ?? '';
  }
}

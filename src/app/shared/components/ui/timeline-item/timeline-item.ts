import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { TimelineEvent, TimelineEventType } from '@features/portal/models/employment-history.model';

const TYPE_CONFIG: Record<TimelineEventType, { label: string; dotClass: string }> = {
  'contratacion':    { label: 'Contratación',            dotClass: 'dot-primary'   },
  'cambio-area':     { label: 'Cambio de área',          dotClass: 'dot-info'      },
  'cambio-puesto':   { label: 'Cambio de puesto',        dotClass: 'dot-warning'   },
  'promocion':       { label: 'Ascenso',                 dotClass: 'dot-success'   },
  'cambio-contrato': { label: 'Condiciones laborales',   dotClass: 'dot-accent'    },
  'estado-actual':   { label: 'Estado actual',           dotClass: 'dot-current'   },
};

@Component({
  selector: 'app-timeline-item',
  imports: [NgClass],
  templateUrl: './timeline-item.html',
  styleUrl: './timeline-item.scss',
})
export class TimelineItem {
  @Input({ required: true }) event!: TimelineEvent;
  @Input() isLast = false;

  get cfg()           { return TYPE_CONFIG[this.event.type] ?? TYPE_CONFIG['cambio-contrato']; }
  get typeLabel()     { return this.cfg.label; }
  get dotClass()      { return this.cfg.dotClass; }
  get formattedDate() {
    const d = new Date(this.event.date);
    return this.event.isCurrent
      ? 'Hoy'
      : d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}

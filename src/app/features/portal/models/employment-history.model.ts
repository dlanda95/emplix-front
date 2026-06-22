export type TimelineEventType =
  | 'contratacion'
  | 'cambio-area'
  | 'cambio-puesto'
  | 'promocion'
  | 'cambio-contrato'
  | 'estado-actual';

export interface TimelineEventDetail {
  label: string;
  value: string;
}

export interface TimelineEvent {
  id:           string;
  type:         TimelineEventType;
  date:         string;
  title:        string;
  description?: string;
  icon:         string;
  isCurrent:    boolean;
  details:      TimelineEventDetail[];
}

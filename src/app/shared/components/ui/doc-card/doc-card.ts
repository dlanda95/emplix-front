import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  EmployeeDocument, DOC_TYPE_LABELS,
  getFileIconConfig, formatFileSize,
} from '@features/portal/models/document.model';

@Component({
  selector: 'app-doc-card',
  imports: [],
  templateUrl: './doc-card.html',
  styleUrl: './doc-card.scss',
})
export class DocCard {
  @Input({ required: true }) doc!: EmployeeDocument;
  @Input() showDelete = true;
  @Output() download = new EventEmitter<EmployeeDocument>();
  @Output() delete   = new EventEmitter<EmployeeDocument>();

  get fileIcon()  { return getFileIconConfig(this.doc.mimeType, this.doc.name); }
  get typeLabel() { return DOC_TYPE_LABELS[this.doc.type] ?? 'Otro'; }
  get fileSize()  { return formatFileSize(this.doc.size); }
  get uploadDate() {
    return new Date(this.doc.createdAt).toLocaleDateString('es-PE', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }
  get displayName() { return this.doc.originalName || this.doc.name; }
}

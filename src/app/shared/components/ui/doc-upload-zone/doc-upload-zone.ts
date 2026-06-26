import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeDocumentType, DOC_TYPE_LABELS } from '@features/portal/models/document.model';

export interface UploadPayload {
  file: File;
  type: EmployeeDocumentType;
}

@Component({
  selector: 'app-doc-upload-zone',
  imports: [FormsModule],
  templateUrl: './doc-upload-zone.html',
  styleUrl: './doc-upload-zone.scss',
})
export class DocUploadZone {
  @Input() docType?: EmployeeDocumentType;

  @Output() fileSelected = new EventEmitter<UploadPayload>();

  readonly isDragging = signal(false);
  readonly selectedFile = signal<File | null>(null);
  selectedType: EmployeeDocumentType = 'OTHER';

  readonly MAX_SIZE_MB = 10;
  readonly ACCEPT_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip';

  readonly typeOptions: { value: EmployeeDocumentType; label: string }[] = Object.entries(DOC_TYPE_LABELS)
    .map(([value, label]) => ({ value: value as EmployeeDocumentType, label }));

  get fileSize() {
    const f = this.selectedFile();
    if (!f) return '';
    return f.size < 1048576
      ? `${(f.size / 1024).toFixed(0)} KB`
      : `${(f.size / 1048576).toFixed(1)} MB`;
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(false);
    const file = e.dataTransfer?.files[0];
    if (file) this.validateAndSet(file);
  }

  onFileInput(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.validateAndSet(file);
  }

  clearFile(): void {
    this.selectedFile.set(null);
  }

  confirmUpload(): void {
    const file = this.selectedFile();
    if (!file) return;
    this.fileSelected.emit({ file, type: this.docType ?? this.selectedType });
  }

  private validateAndSet(file: File): void {
    if (file.size > this.MAX_SIZE_MB * 1048576) {
      alert(`El archivo supera el límite de ${this.MAX_SIZE_MB} MB.`);
      return;
    }
    this.selectedFile.set(file);
  }
}

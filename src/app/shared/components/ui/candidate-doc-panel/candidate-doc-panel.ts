import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule }                               from '@angular/common';
import { DomSanitizer, SafeResourceUrl, SafeUrl }    from '@angular/platform-browser';
import { FilterChips, EmptyState }                   from '@shared/ui';
import type { FilterChipItem }                       from '@shared/ui';
import {
  DOC_CATEGORIES, DocCategoryId, EmployeeDocument,
  filterDocsByCategory, getFileIconConfig, formatFileSize, DOC_TYPE_LABELS,
} from '@features/portal/models/document.model';

@Component({
  selector:    'app-candidate-doc-panel',
  imports:     [CommonModule, FilterChips, EmptyState],
  templateUrl: './candidate-doc-panel.html',
  styleUrl:    './candidate-doc-panel.scss',
  host:        { style: 'display:block' },
})
export class CandidateDocPanel {
  private readonly sanitizer = inject(DomSanitizer);

  readonly docs    = input<EmployeeDocument[]>([]);
  readonly docUrls = input<Record<string, string>>({});

  readonly activeCategory = signal<DocCategoryId>('ALL');
  readonly previewDoc     = signal<EmployeeDocument | null>(null);

  private readonly previewRawUrl = signal<string | null>(null);

  readonly previewUrl: ReturnType<typeof computed<SafeResourceUrl | null>> = computed(() => {
    const url = this.previewRawUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  readonly previewImageUrl: ReturnType<typeof computed<SafeUrl | null>> = computed(() => {
    const url = this.previewRawUrl();
    return url ? this.sanitizer.bypassSecurityTrustUrl(url) : null;
  });

  readonly docCategoryChips = computed<FilterChipItem[]>(() => {
    const docs = this.docs();
    return DOC_CATEGORIES
      .filter(cat =>
        cat.type === 'ALL'
          ? docs.length > 0
          : filterDocsByCategory(docs, cat.type).length > 0
      )
      .map(cat => ({ id: cat.type, label: cat.label }));
  });

  readonly filteredDocs = computed<EmployeeDocument[]>(() =>
    filterDocsByCategory(this.docs(), this.activeCategory())
  );

  // ── Helpers ──────────────────────────────────────────────────────────────────

  fileIcon(doc: EmployeeDocument) {
    return getFileIconConfig(doc.mimeType, doc.name);
  }

  typeLabel(doc: EmployeeDocument): string {
    return DOC_TYPE_LABELS[doc.type] ?? 'Otro';
  }

  formatSize(bytes: number): string {
    return formatFileSize(bytes);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  displayName(doc: EmployeeDocument): string {
    return doc.originalName ?? doc.name;
  }

  isPdf(doc: EmployeeDocument): boolean {
    return doc.mimeType?.includes('pdf') || doc.name?.toLowerCase().endsWith('.pdf');
  }

  isImage(doc: EmployeeDocument): boolean {
    return doc.mimeType?.startsWith('image/');
  }

  canInlinePreview(doc: EmployeeDocument): boolean {
    return this.isPdf(doc) || this.isImage(doc);
  }

  isActivePreview(doc: EmployeeDocument): boolean {
    return this.previewDoc()?.id === doc.id;
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  openPreview(doc: EmployeeDocument): void {
    if (this.isActivePreview(doc)) { this.closePreview(); return; }

    const url = this.docUrls()[doc.id];
    if (!url) return;

    if (this.canInlinePreview(doc)) {
      this.previewDoc.set(doc);
      this.previewRawUrl.set(url);
    } else {
      const isOffice = doc.mimeType?.includes('word') || doc.mimeType?.includes('spreadsheet')
                    || !!doc.name?.match(/\.(docx?|xlsx?)$/i);
      const target = isOffice
        ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`
        : url;
      window.open(target, '_blank', 'noopener');
    }
  }

  closePreview(): void {
    this.previewDoc.set(null);
    this.previewRawUrl.set(null);
  }

  download(doc: EmployeeDocument): void {
    const url = this.docUrls()[doc.id];
    if (url) window.open(url, '_blank', 'noopener');
  }
}

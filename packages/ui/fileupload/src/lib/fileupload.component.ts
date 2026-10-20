import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';

export interface CbFileUploadEvent {
  files: File[];
}

/** Archivos descartados al elegirlos o soltarlos, con el motivo. */
export interface CbFileRejectEvent {
  files: { file: File; reason: 'size' | 'type' }[];
}

/**
 * FileUpload de CaribeNG: selector de archivos con arrastrar y soltar,
 * validación de tamaño máximo y lista de archivos seleccionados.
 */
@Component({
  selector: 'cb-file-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-file-upload',
    '[class.cb-is-dragover]': 'dragging()',
  },
  template: `
    <input
      #fileInput
      type="file"
      class="cb-file-upload__native"
      [attr.accept]="accept() || null"
      [multiple]="multiple()"
      [disabled]="disabled()"
      (change)="onFileChange($event)"
    />
    <div
      class="cb-file-upload__dropzone"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
    >
      <div class="cb-file-upload__actions">
        <button
          type="button"
          class="cb-file-upload__btn cb-file-upload__btn--primary"
          [disabled]="disabled()"
          (click)="openPicker()"
        >
          <cb-icon name="upload" [size]="15" aria-hidden="true" />
          <span>{{ (chooseLabel() ?? t().chooseFile) }}</span>
        </button>
        @if (files().length > 0) {
          <button
            type="button"
            class="cb-file-upload__btn"
            [disabled]="disabled()"
            (click)="triggerUpload()"
          >
            <cb-icon name="check" [size]="15" aria-hidden="true" />
            <span>{{ (uploadLabel() ?? t().upload) }}</span>
          </button>
          <button
            type="button"
            class="cb-file-upload__btn"
            [disabled]="disabled()"
            (click)="clear()"
          >
            <cb-icon name="x" [size]="15" aria-hidden="true" />
            <span>{{ t().clear }}</span>
          </button>
        }
      </div>

      @if (rejected().length) {
        <ul class="cb-file-upload__errors" role="alert">
          @for (r of rejected(); track $index) {
            <li>
              {{
                r.reason === 'size'
                  ? fmt(t().fileTooLarge, r.file.name, formatSize(maxFileSize() ?? 0))
                  : fmt(t().fileTypeNotAllowed, r.file.name)
              }}
            </li>
          }
        </ul>
      }

      @if (files().length === 0) {
        <p class="cb-file-upload__empty">{{ fmt(t().dropFiles, (chooseLabel() ?? t().chooseFile)) }}</p>
      } @else {
        <ul class="cb-file-upload__list">
          @for (file of files(); track file.name + file.size; let idx = $index) {
            <li class="cb-file-upload__item">
              <span class="cb-file-upload__name">{{ file.name }}</span>
              <span class="cb-file-upload__size">{{ formatSize(file.size) }}</span>
              <button
                type="button"
                class="cb-file-upload__remove"
                [attr.aria-label]="fmt(t().removeItem, file.name)"
                (click)="removeAt(idx)"
              >
                <cb-icon name="x" [size]="14" aria-hidden="true" />
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styleUrl: './fileupload.component.css',
})
export class CbFileUpload {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Rellena `{0}`, `{1}`… de un texto traducido. */
  protected readonly fmt = cbFormat;
  readonly accept = input<string>('');
  readonly multiple = input<boolean>(false);
  readonly maxFileSize = input<number | null>(null);
  readonly disabled = input<boolean>(false);
  readonly chooseLabel = input<string | undefined>(undefined);
  readonly uploadLabel = input<string | undefined>(undefined);

  readonly selectFiles = output<CbFileUploadEvent>();
  readonly uploadHandler = output<CbFileUploadEvent>();
  /** Se emite con los archivos descartados por tamaño (`maxFileSize`) o tipo (`accept`). */
  readonly rejectFiles = output<CbFileRejectEvent>();

  readonly files = signal<File[]>([]);
  /** Archivos descartados en la última selección (se muestran como aviso). */
  protected readonly rejected = signal<CbFileRejectEvent['files']>([]);
  readonly dragging = signal(false);

  private readonly fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  openPicker(): void {
    if (this.disabled()) return;
    this.fileInputRef()?.nativeElement.click();
  }

  protected onFileChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    if (inputEl.files) {
      this.addFiles(Array.from(inputEl.files));
    }
    inputEl.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled()) this.dragging.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    if (this.disabled()) return;
    const dropped = event.dataTransfer?.files;
    if (dropped) {
      this.addFiles(Array.from(dropped));
    }
  }

  /** Añade archivos validando `accept` y `maxFileSize`; ignora los repetidos. */
  addFiles(incoming: File[]): void {
    const max = this.maxFileSize();
    const valid: File[] = [];
    const rejected: CbFileRejectEvent['files'] = [];
    for (const file of incoming) {
      if (!this.isAccepted(file)) rejected.push({ file, reason: 'type' });
      else if (max != null && file.size > max) rejected.push({ file, reason: 'size' });
      else valid.push(file);
    }
    this.rejected.set(rejected);
    if (rejected.length) this.rejectFiles.emit({ files: rejected });
    if (!valid.length) return;

    const same = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
    const next = this.multiple()
      ? [...this.files(), ...valid.filter((f, i) => !this.files().some((e) => same(e, f)) && valid.findIndex((v) => same(v, f)) === i)]
      : valid.slice(0, 1);
    this.files.set(next);
    this.selectFiles.emit({ files: next });
  }

  removeAt(index: number): void {
    const next = this.files().filter((_, i) => i !== index);
    this.files.set(next);
  }

  clear(): void {
    this.files.set([]);
    this.rejected.set([]);
  }

  triggerUpload(): void {
    this.uploadHandler.emit({ files: [...this.files()] });
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /** Comprueba `accept` (extensiones `.pdf`, tipos `image/png` o comodines `image/*`). */
  private isAccepted(file: File): boolean {
    const rules = this.accept()
      .split(',')
      .map((r) => r.trim().toLowerCase())
      .filter(Boolean);
    if (!rules.length) return true;
    const name = file.name.toLowerCase();
    const type = (file.type || '').toLowerCase();
    return rules.some((rule) => {
      if (rule.startsWith('.')) return name.endsWith(rule);
      if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
      return type === rule;
    });
  }
}

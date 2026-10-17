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
import { CbIconComponent } from '@caribeng/ui/icon';

export interface CbFileUploadEvent {
  files: File[];
}

/**
 * FileUpload de CaribeNG: selector de archivos con arrastrar y soltar,
 * validación de tamaño máximo y lista de archivos seleccionados.
 */
@Component({
  selector: 'cb-file-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIconComponent],
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
          <span>{{ chooseLabel() }}</span>
        </button>
        @if (files().length > 0) {
          <button
            type="button"
            class="cb-file-upload__btn"
            [disabled]="disabled()"
            (click)="triggerUpload()"
          >
            <cb-icon name="check" [size]="15" aria-hidden="true" />
            <span>{{ uploadLabel() }}</span>
          </button>
          <button
            type="button"
            class="cb-file-upload__btn"
            [disabled]="disabled()"
            (click)="clear()"
          >
            <cb-icon name="x" [size]="15" aria-hidden="true" />
            <span>Limpiar</span>
          </button>
        }
      </div>

      @if (files().length === 0) {
        <p class="cb-file-upload__empty">Arrastra archivos aquí o pulsa "{{ chooseLabel() }}".</p>
      } @else {
        <ul class="cb-file-upload__list">
          @for (file of files(); track file.name + file.size; let idx = $index) {
            <li class="cb-file-upload__item">
              <span class="cb-file-upload__name">{{ file.name }}</span>
              <span class="cb-file-upload__size">{{ formatSize(file.size) }}</span>
              <button
                type="button"
                class="cb-file-upload__remove"
                [attr.aria-label]="'Quitar ' + file.name"
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
export class CbFileUploadComponent {
  readonly accept = input<string>('');
  readonly multiple = input<boolean>(false);
  readonly maxFileSize = input<number | null>(null);
  readonly disabled = input<boolean>(false);
  readonly chooseLabel = input<string>('Elegir archivo');
  readonly uploadLabel = input<string>('Subir');

  readonly selectFiles = output<CbFileUploadEvent>();
  readonly uploadHandler = output<CbFileUploadEvent>();

  readonly files = signal<File[]>([]);
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

  addFiles(incoming: File[]): void {
    const max = this.maxFileSize();
    const valid = max != null ? incoming.filter((f) => f.size <= max) : incoming;
    const next = this.multiple() ? [...this.files(), ...valid] : valid.slice(0, 1);
    this.files.set(next);
    this.selectFiles.emit({ files: next });
  }

  removeAt(index: number): void {
    const next = this.files().filter((_, i) => i !== index);
    this.files.set(next);
  }

  clear(): void {
    this.files.set([]);
  }

  triggerUpload(): void {
    this.uploadHandler.emit({ files: [...this.files()] });
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
}

import {
  computed,
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';

/**
 * File-download de Caribe Design: fila de archivo con nombre, tamaño y botón de
 * descarga.
 *
 * @example
 * ```html
 * <cb-file-download fileName="Extracto.pdf" fileSize="420 KB" (download)="go($event)" />
 * ```
 */
let nextId = 0;

@Component({
  selector: 'cb-file-download',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-file-download-host' },
  template: `
    <div class="cb-file-download">
      <span class="cb-file-download__icon" aria-hidden="true">{{ extension() }}</span>
      <div class="cb-file-download__meta">
        <strong class="cb-file-download__name" [id]="nameId">{{ fileName() }}</strong>
        <span class="cb-file-download__size">{{ fileSize() }}</span>
      </div>
      <!-- Con href, enlace de descarga nativo; sin él, botón que emite (download) para descargarlo desde la app. -->
      @if (href() && !disabled()) {
        <a
          class="cb-file-download__btn"
          [href]="href()"
          [attr.download]="fileName() || ''"
          [attr.aria-describedby]="fileName() ? nameId : null"
          (click)="onDownload()"
        >
          {{ (buttonLabel() ?? t().download) }}
        </a>
      } @else {
        <button
          type="button"
          class="cb-file-download__btn"
          [attr.aria-describedby]="fileName() ? nameId : null"
          (click)="onDownload()"
          [disabled]="disabled()"
        >
          {{ (buttonLabel() ?? t().download) }}
        </button>
      }
    </div>
  `,
  styleUrl: './file-download.component.css',
})
export class CbFileDownload {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly fileName = input<string>('');
  readonly fileSize = input<string>('');
  /** Tipo de archivo mostrado en la insignia, a partir de la extensión (p. ej. PDF, XLSX). */
  protected readonly extension = computed(() => {
    const name = this.fileName();
    const dot = name.lastIndexOf('.');
    return dot > 0 ? name.slice(dot + 1, dot + 5).toUpperCase() : '';
  });
  readonly href = input<string>('');
  readonly buttonLabel = input<string | undefined>(undefined);
  readonly disabled = input<boolean>(false);

  readonly download = output<string>();

  /** Id del nombre: describe el botón ("Descargar" → "Certificado.pdf"). */
  protected readonly nameId = `cb-file-download-${++nextId}-name`;

  protected onDownload(): void {
    if (this.disabled()) return;
    this.download.emit(this.fileName());
  }
}

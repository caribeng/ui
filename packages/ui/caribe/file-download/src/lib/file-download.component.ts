import {
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
@Component({
  selector: 'cb-file-download',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-file-download-host' },
  template: `
    <div class="cb-file-download">
      <span class="cb-file-download__icon" aria-hidden="true">PDF</span>
      <div class="cb-file-download__meta">
        <strong class="cb-file-download__name">{{ fileName() }}</strong>
        <span class="cb-file-download__size">{{ fileSize() }}</span>
      </div>
      <button
        type="button"
        class="cb-file-download__btn"
        (click)="onDownload()"
        [disabled]="disabled()"
      >
        {{ (buttonLabel() ?? t().download) }}
      </button>
    </div>
  `,
  styleUrl: './file-download.component.css',
})
export class CbFileDownload {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly fileName = input<string>('Certificado_Bancario.pdf');
  readonly fileSize = input<string>('420 KB');
  readonly href = input<string>('');
  readonly buttonLabel = input<string | undefined>(undefined);
  readonly disabled = input<boolean>(false);

  readonly download = output<string>();

  protected onDownload(): void {
    if (this.disabled()) return;
    this.download.emit(this.fileName());
  }
}

import { Directive, inject, input, output } from '@angular/core';
import { CbClipboard } from './clipboard.service';

/**
 * Copia un texto al portapapeles al pulsar el elemento (botón, enlace, icono…).
 * Para el aviso visual usa `cb-copy-button`, o reacciona a `copied`.
 *
 * @example
 * ```html
 * <button type="button" [cbCopy]="cuenta" (copied)="toast.add({ summary: 'Copiado' })">Copiar</button>
 * ```
 */
@Directive({
  selector: '[cbCopy]',
  host: { '(click)': 'copy()' },
})
export class CbCopy {
  private readonly clipboard = inject(CbClipboard);

  /** Texto que se copia. */
  readonly cbCopy = input<string | number | null | undefined>('');

  /** Texto copiado. */
  readonly copied = output<string>();
  /** El navegador no permitió copiar. */
  readonly copyError = output<string>();

  /** Copia el texto. Resuelve `true` si lo consiguió. */
  async copy(): Promise<boolean> {
    const text = String(this.cbCopy() ?? '');
    const ok = await this.clipboard.copy(text);
    if (ok) this.copied.emit(text);
    else this.copyError.emit(text);
    return ok;
  }
}

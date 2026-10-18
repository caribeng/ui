import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/**
 * Loader de Caribe Design: indicador de carga en línea con spinner y texto.
 *
 * @example
 * ```html
 * <cb-loader text="Cargando…" size="md" />
 * ```
 */
@Component({
  selector: 'cb-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-loader-host' },
  template: `
    <div class="cb-loader cb-loader--{{ size() }}" role="status" aria-live="polite">
      <span class="cb-loader__spinner" aria-hidden="true"></span>
      @if (text()) {
        <span class="cb-loader__text">{{ text() }}</span>
      }
    </div>
  `,
  styleUrl: './loader.component.css',
})
export class CbLoader {
  readonly text = input<string>('Cargando información…');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
}

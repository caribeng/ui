import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/**
 * Preloader de Caribe Design: pantalla/bloque de carga inicial con marca,
 * barra de progreso indeterminada y mensaje.
 *
 * @example
 * ```html
 * <cb-preloader title="CaribeNG" label="Preparando…" />
 * ```
 */
@Component({
  selector: 'cb-preloader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-preloader-host' },
  template: `
    @if (active()) {
      <div class="cb-preloader" role="alert" aria-busy="true">
        <strong class="cb-preloader__title">{{ title() }}</strong>
        <div class="cb-preloader__bar" aria-hidden="true">
          <span class="cb-preloader__bar-fill"></span>
        </div>
        <span class="cb-preloader__label">{{ label() }}</span>
      </div>
    }
  `,
  styleUrl: './preloader.component.css',
})
export class CbPreloader {
  readonly active = input<boolean>(true);
  readonly title = input<string>('CaribeNG');
  readonly label = input<string>('Preparando tu sesión segura…');
}

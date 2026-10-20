import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';

/**
 * Header de Caribe Design: cabecera de pantalla con título, subtítulo opcional,
 * botón de retroceso y una zona de acciones proyectadas.
 *
 * @example
 * ```html
 * <cb-header title="Transferencias" subtitle="Nueva" [showBack]="true" />
 * ```
 */
@Component({
  selector: 'cb-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-header-host' },
  template: `
    <header class="cb-header">
      <div class="cb-header__start">
        @if (showBack()) {
          <button
            type="button"
            class="cb-header__back"
            [attr.aria-label]="t().back"
            (click)="backClick.emit()"
          >
            <span aria-hidden="true">←</span>
          </button>
        }
        <div class="cb-header__titles">
          <strong class="cb-header__title">{{ title() }}</strong>
          @if (subtitle()) {
            <span class="cb-header__subtitle">{{ subtitle() }}</span>
          }
        </div>
      </div>
      <div class="cb-header__actions">
        <ng-content />
      </div>
    </header>
  `,
  styleUrl: './header.component.css',
})
export class CbHeader {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Título principal. */
  readonly title = input<string>('');
  /** Subtítulo opcional. */
  readonly subtitle = input<string>('');
  /** Muestra el botón de retroceso. */
  readonly showBack = input<boolean>(false);
  /** Emite al pulsar retroceso. */
  readonly backClick = output<void>();
}

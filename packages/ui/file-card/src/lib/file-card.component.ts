import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';

/**
 * Tarjeta de categoría/almacenamiento de CaribeNG: icono con tinte, título y
 * subtítulo a la izquierda; dos valores alineados a la derecha. Útil para
 * resúmenes de media, almacenamiento o métricas de categoría.
 *
 * @example
 * ```html
 * <cb-file-card icon="image" color="#10b981" title="Imágenes"
 *   subtitle="17% usado" value="245 archivos" valueSub="26.4 GB" />
 * ```
 */
@Component({
  selector: 'cb-file-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-file-card' },
  template: `
    <div class="cb-file-card__left">
      <span class="cb-file-card__icon" [style.background]="tintBg()" [style.color]="color() || null">
        <cb-icon [name]="icon()" [size]="20" aria-hidden="true" />
      </span>
      <div class="cb-file-card__text">
        <span class="cb-file-card__title">{{ title() }}</span>
        @if (subtitle()) {
          <span class="cb-file-card__subtitle">{{ subtitle() }}</span>
        }
      </div>
    </div>
    <div class="cb-file-card__values">
      <span class="cb-file-card__value">{{ value() }}</span>
      @if (valueSub()) {
        <span class="cb-file-card__value-sub">{{ valueSub() }}</span>
      }
    </div>
  `,
  styleUrl: './file-card.component.css',
})
export class CbFileCard {
  /** Nombre del icono (del set de CaribeNG). */
  readonly icon = input<string>('file');
  /** Color del icono (CSS). El fondo del recuadro se deriva con transparencia. */
  readonly color = input<string>('');
  /** Título principal. */
  readonly title = input<string>('');
  /** Subtítulo (p. ej. "17% usado"). */
  readonly subtitle = input<string>('');
  /** Valor principal a la derecha (p. ej. "245 archivos"). */
  readonly value = input<string>('');
  /** Valor secundario a la derecha (p. ej. "26.4 GB"). */
  readonly valueSub = input<string>('');

  /** Fondo tintado derivado del color (cualquier color CSS: hex, rgb(), var(--…)). */
  protected tintBg(): string | null {
    const c = this.color();
    return c ? `color-mix(in srgb, ${c} 12%, transparent)` : null;
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
} from '@angular/core';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';

/**
 * Dots-indicator de Caribe Design: indicador de paginación por puntos. El punto
 * activo se alarga; cada punto es navegable.
 *
 * @example
 * ```html
 * <cb-dots-indicator [count]="5" [(activeIndex)]="page" />
 * ```
 */
@Component({
  selector: 'cb-dots-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-dots-indicator-host' },
  template: `
    <div class="cb-dots-indicator" role="tablist" [attr.aria-label]="t().pageIndicator">
      @for (idx of indices(); track idx) {
        <button
          type="button"
          class="cb-dots-indicator__dot"
          [class.cb-dots-indicator__dot--active]="activeIndex() === idx"
          role="tab"
          [attr.aria-selected]="activeIndex() === idx"
          [attr.aria-label]="fmt(t().page, idx + 1)"
          (click)="activeIndex.set(idx)"
        ></button>
      }
    </div>
  `,
  styleUrl: './dots-indicator.component.css',
})
export class CbDotsIndicator {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Rellena `{0}`, `{1}`… de un texto traducido. */
  protected readonly fmt = cbFormat;
  /** Número de puntos. */
  readonly count = input<number>(4);
  /** Índice activo (two-way). */
  readonly activeIndex = model<number>(0);

  protected readonly indices = computed(() =>
    Array.from({ length: Math.max(1, this.count()) }, (_, i) => i),
  );
}

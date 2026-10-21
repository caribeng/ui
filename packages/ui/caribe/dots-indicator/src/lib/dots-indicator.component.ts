import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  inject,
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
    <div
      class="cb-dots-indicator"
      role="tablist"
      [attr.aria-label]="t().pageIndicator"
      (keydown)="onKeydown($event)"
    >
      @for (idx of indices(); track idx) {
        <button
          type="button"
          class="cb-dots-indicator__dot"
          [class.cb-dots-indicator__dot--active]="activeIndex() === idx"
          role="tab"
          [attr.aria-selected]="activeIndex() === idx"
          [attr.tabindex]="activeIndex() === idx ? 0 : -1"
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

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Patrón *tabs*: flechas (circular), Inicio y Fin cambian de página y mueven el foco. */
  protected onKeydown(event: KeyboardEvent): void {
    const last = this.indices().length - 1;
    const cur = this.activeIndex();
    const target =
      event.key === 'ArrowRight' ? (cur < last ? cur + 1 : 0)
      : event.key === 'ArrowLeft' ? (cur > 0 ? cur - 1 : last)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : -1;
    if (target < 0) return;
    event.preventDefault();
    this.activeIndex.set(target);
    this.host.nativeElement.querySelectorAll<HTMLElement>('.cb-dots-indicator__dot')[target]?.focus();
  }

  protected readonly indices = computed(() =>
    Array.from({ length: Math.max(1, this.count()) }, (_, i) => i),
  );
}

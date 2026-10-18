import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';

/**
 * Skeleton de CaribeNG: marcador de posición animado durante la carga.
 *
 * @example
 * ```html
 * <cb-skeleton width="12rem" />
 * <cb-skeleton shape="circle" width="3rem" />
 * <cb-skeleton height="8rem" />
 * ```
 */
@Component({
  selector: 'cb-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-skeleton',
    '[class]': "'cb-skeleton cb-skeleton--' + shape() + ' cb-skeleton--' + animation()",
    '[style.width]': 'width()',
    '[style.height]': 'resolvedHeight()',
    'aria-hidden': 'true',
  },
  template: ``,
  styleUrl: './skeleton.component.css',
})
export class CbSkeleton {
  /** Ancho CSS (p. ej. `100%`, `12rem`). */
  readonly width = input<string>('100%');
  /** Alto CSS. En `circle` se iguala al ancho. */
  readonly height = input<string>('');
  readonly shape = input<'text' | 'rect' | 'circle'>('text');
  readonly animation = input<'pulse' | 'wave' | 'none'>('wave');

  protected readonly resolvedHeight = computed(() => {
    if (this.shape() === 'circle') return this.width();
    if (this.height()) return this.height();
    return this.shape() === 'text' ? '1rem' : '4rem';
  });
}

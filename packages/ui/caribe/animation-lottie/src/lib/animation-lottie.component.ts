import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  signal,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';

/**
 * Animation-lottie de Caribe Design: contenedor de animación (placeholder
 * animado mientras se integra Lottie real).
 *
 * @example
 * ```html
 * <cb-animation-lottie size="96px" ariaLabel="Cargando" />
 * ```
 */
@Component({
  selector: 'cb-animation-lottie',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-animation-lottie-host',
    '[style.width]': 'size()',
    '[style.height]': 'size()',
  },
  template: `
    <div class="cb-animation-lottie" role="img" [attr.aria-label]="(ariaLabel() ?? t().animation)">
      <svg
        class="cb-animation-lottie__svg"
        [class.cb-is-playing]="playing()"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="24"
          r="18"
          fill="none"
          stroke="var(--cb-color-primary-500, #10b981)"
          stroke-width="4"
          stroke-linecap="round"
          stroke-dasharray="80 32"
        />
      </svg>
    </div>
  `,
  styleUrl: './animation-lottie.component.css',
})
export class CbAnimationLottie {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly src = input<string>('');
  readonly autoplay = input<boolean>(true);
  readonly loop = input<boolean>(true);
  readonly size = input<string>('96px');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly playing = signal(true);

  play(): void {
    this.playing.set(true);
  }
  pause(): void {
    this.playing.set(false);
  }
}

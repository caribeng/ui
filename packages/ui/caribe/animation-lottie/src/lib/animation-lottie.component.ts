import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, signal } from '@angular/core';

@Component({
  selector: 'cb-animation-lottie',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-animation-lottie',
    '[style.width]': 'size()',
    '[style.height]': 'size()',
  },
  template: `
    <div
      class="cb-caribe-box"
      role="img"
      [attr.aria-label]="ariaLabel()"
      style="justify-content: center; width: 100%; height: 100%"
    >
      <svg viewBox="0 0 48 48" width="36" height="36" aria-hidden="true">
        <circle
          cx="24"
          cy="24"
          r="18"
          fill="none"
          stroke="var(--cb-color-primary-500, #10b981)"
          stroke-width="4"
          stroke-dasharray="80 32"
        />
      </svg>
    </div>
  `,
  styleUrl: './animation-lottie.component.css',
})
export class CbAnimationLottie {
  readonly src = input<string>('');
  readonly autoplay = input<boolean>(true);
  readonly loop = input<boolean>(true);
  readonly size = input<string>('96px');
  readonly ariaLabel = input<string>('Animación interactiva');
  readonly playing = signal(true);

  play(): void {
    this.playing.set(true);
  }
  pause(): void {
    this.playing.set(false);
  }
}

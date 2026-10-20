import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';

@Component({
  selector: 'cb-stroke',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-stroke',
    '[style.width]': 'size()',
  },
  template: `
    <svg
      class="cb-stroke__svg"
      viewBox="0 0 240 36"
      [attr.role]="ariaHidden() ? null : 'img'"
      [attr.aria-hidden]="ariaHidden() ? 'true' : null"
      [attr.aria-label]="ariaHidden() ? null : (alt() ?? t().decorativeStroke)"
      style="width: 100%; height: auto"
    >
      <path
        d="M6 26 C 58 4, 114 34, 172 12 C 198 4, 218 22, 234 14"
        fill="none"
        [attr.stroke]="color()"
        stroke-width="6"
        stroke-linecap="round"
      />
    </svg>
  `,
  styleUrl: './stroke.component.css',
})
export class CbStroke {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly name = input<string>('01');
  readonly size = input<string>('220px');
  readonly color = input<string>('var(--cb-color-primary-500, #10b981)');
  readonly ariaHidden = input<boolean>(true);
  readonly alt = input<string | undefined>(undefined);
}

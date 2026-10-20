import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';

@Component({
  selector: 'cb-pictogram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-pictogram',
    '[style.width]': 'size()',
    '[style.height]': 'size()',
  },
  template: `
    <svg
      viewBox="0 0 64 64"
      role="img"
      [attr.aria-label]="(alt() ?? t().pictogram) || name()"
      style="width: 100%; height: 100%"
    >
      <circle cx="32" cy="32" r="28" fill="var(--cb-color-primary-100, #d1fae5)" />
      <path d="M22 33l7 7 14-15" fill="none" stroke="var(--cb-color-primary-600, #059669)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
  styleUrl: './pictogram.component.css',
})
export class CbPictogram {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly name = input<string>('security-shield');
  readonly size = input<string>('56px');
  readonly alt = input<string | undefined>(undefined);
}

import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

@Component({
  selector: 'cb-illustration',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-illustration',
    '[style.width]': 'size()',
  },
  template: `
    <svg
      viewBox="0 0 160 120"
      role="img"
      [attr.aria-label]="alt() || name()"
      style="width: 100%; height: auto"
    >
      <rect x="12" y="14" width="136" height="92" rx="16" fill="var(--cb-color-primary-50, #ecfdf5)" />
      <circle cx="56" cy="58" r="22" fill="var(--cb-color-primary-500, #10b981)" />
      <rect x="88" y="42" width="44" height="10" rx="5" fill="var(--cb-color-primary-600, #059669)" />
      <rect x="88" y="60" width="32" height="8" rx="4" fill="var(--cb-color-primary-300, #6ee7b7)" />
    </svg>
  `,
  styleUrl: './illustration.component.css',
})
export class CbIllustration {
  readonly name = input<string>('transfer-success');
  readonly size = input<string>('160px');
  readonly alt = input<string>('Ilustración Caribe');
}

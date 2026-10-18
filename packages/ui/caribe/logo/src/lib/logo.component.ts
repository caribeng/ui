import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

@Component({
  selector: 'cb-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-logo',
    '[class.cb-logo--negative]': 'negative()',
    '[style.width]': 'size()',
  },
  template: `
    <svg
      class="cb-logo__svg"
      viewBox="0 0 180 40"
      role="img"
      [attr.aria-label]="alt() || name()"
      style="width: 100%; height: auto"
    >
      <rect x="2" y="6" width="28" height="28" rx="7" fill="var(--cb-color-primary-500, #10b981)" />
      <path d="M10 20h12M16 14v12" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
      <text
        x="38"
        y="25"
        font-size="15"
        font-weight="700"
        [attr.fill]="negative() ? '#ffffff' : 'var(--cb-color-text-strong, #0f172a)'"
      >
        {{ label() || name() }}
      </text>
    </svg>
  `,
  styleUrl: './logo.component.css',
})
export class CbLogo {
  readonly name = input<string>('caribe-horizontal');
  readonly label = input<string>('Caribe');
  readonly size = input<string>('160px');
  readonly negative = input<boolean>(false);
  readonly alt = input<string>('Logo Caribe');
}

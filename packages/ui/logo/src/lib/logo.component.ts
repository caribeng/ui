import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';

export type CbLogoFormat =
  | 'caribe-horizontal'
  | 'caribe-icon'
  | 'caribe-isotipo'
  | 'caribe-vertical'
  | 'caribe-mono'
  | string;

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
    @switch (variant()) {
      @case ('icon') {
        <svg
          class="cb-logo__svg"
          viewBox="0 0 64 68"
          role="img"
          [attr.aria-label]="alt() || name()"
          style="width: 100%; height: auto"
        >
          <path d="M32 2L3 12.5L7.6 51.5L32 65.5L56.4 51.5L61 12.5L32 2Z" fill="var(--cb-color-primary-500, #10b981)" />
          <path d="M32 2V65.5L56.4 51.5L61 12.5L32 2Z" fill="var(--cb-color-primary-600, #059669)" />
          <path d="M32 6.2L7.5 15.2L11.4 48.6L32 60.5L52.6 48.6L56.5 15.2L32 6.2Z" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1.5" />
          <path d="M32 13L18.5 41H24.2L27.1 34.4H36.9L39.8 41H45.5L32 13ZM29.3 29.2L32 22.8L34.7 29.2H29.3Z" fill="#ffffff" />
          <path d="M15 46.5C19.5 43.5 24.5 43.5 29 46.5C33.5 49.5 38.5 49.5 43 46.5C45.5 44.8 47.5 44.2 49.5 44.5" stroke="var(--cb-color-primary-200, #a7f3d0)" stroke-width="3.2" stroke-linecap="round" />
          <path d="M19 52.5C23 50 27.5 50 31.5 52.5C35.5 55 40 55 44.5 52.2" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" />
        </svg>
      }
      @case ('vertical') {
        <svg
          class="cb-logo__svg"
          viewBox="0 0 160 116"
          role="img"
          [attr.aria-label]="alt() || name()"
          style="width: 100%; height: auto"
        >
          <g transform="translate(48, 2)">
            <path d="M32 2L3 12.5L7.6 51.5L32 65.5L56.4 51.5L61 12.5L32 2Z" fill="var(--cb-color-primary-500, #10b981)" />
            <path d="M32 2V65.5L56.4 51.5L61 12.5L32 2Z" fill="var(--cb-color-primary-600, #059669)" />
            <path d="M32 6.2L7.5 15.2L11.4 48.6L32 60.5L52.6 48.6L56.5 15.2L32 6.2Z" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1.5" />
            <path d="M32 13L18.5 41H24.2L27.1 34.4H36.9L39.8 41H45.5L32 13ZM29.3 29.2L32 22.8L34.7 29.2H29.3Z" fill="#ffffff" />
            <path d="M15 46.5C19.5 43.5 24.5 43.5 29 46.5C33.5 49.5 38.5 49.5 43 46.5C45.5 44.8 47.5 44.2 49.5 44.5" stroke="var(--cb-color-primary-200, #a7f3d0)" stroke-width="3.2" stroke-linecap="round" />
            <path d="M19 52.5C23 50 27.5 50 31.5 52.5C35.5 55 40 55 44.5 52.2" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" />
          </g>
          <text
            x="80"
            y="98"
            text-anchor="middle"
            font-size="24"
            font-weight="800"
            letter-spacing="-0.03em"
            [attr.fill]="negative() ? '#ffffff' : 'var(--cb-color-text-strong, #0f172a)'"
          >
            {{ label() }}<tspan fill="var(--cb-color-primary-500, #10b981)">NG</tspan>
          </text>
        </svg>
      }
      @case ('mono') {
        <svg
          class="cb-logo__svg"
          viewBox="0 0 240 68"
          role="img"
          [attr.aria-label]="alt() || name()"
          style="width: 100%; height: auto"
        >
          <g>
            <path
              d="M32 2L3 12.5L7.6 51.5L32 65.5L56.4 51.5L61 12.5L32 2Z"
              [attr.fill]="negative() ? '#ffffff' : 'var(--cb-color-text-strong, #0f172a)'"
            />
            <path
              d="M32 13L18.5 41H24.2L27.1 34.4H36.9L39.8 41H45.5L32 13ZM29.3 29.2L32 22.8L34.7 29.2H29.3Z"
              [attr.fill]="negative() ? '#0f172a' : '#ffffff'"
            />
            <path
              d="M15 46.5C19.5 43.5 24.5 43.5 29 46.5C33.5 49.5 38.5 49.5 43 46.5C45.5 44.8 47.5 44.2 49.5 44.5"
              [attr.stroke]="negative() ? '#0f172a' : '#ffffff'"
              stroke-width="3.2"
              stroke-linecap="round"
            />
            <path
              d="M19 52.5C23 50 27.5 50 31.5 52.5C35.5 55 40 55 44.5 52.2"
              [attr.stroke]="negative() ? '#0f172a' : '#ffffff'"
              stroke-width="2.6"
              stroke-linecap="round"
            />
          </g>
          <text
            x="74"
            y="44"
            font-size="31"
            font-weight="800"
            letter-spacing="-0.03em"
            [attr.fill]="negative() ? '#ffffff' : 'var(--cb-color-text-strong, #0f172a)'"
          >
            {{ label() }}NG
          </text>
        </svg>
      }
      @default {
        <svg
          class="cb-logo__svg"
          viewBox="0 0 240 68"
          role="img"
          [attr.aria-label]="alt() || name()"
          style="width: 100%; height: auto"
        >
          <g>
            <path d="M32 2L3 12.5L7.6 51.5L32 65.5L56.4 51.5L61 12.5L32 2Z" fill="var(--cb-color-primary-500, #10b981)" />
            <path d="M32 2V65.5L56.4 51.5L61 12.5L32 2Z" fill="var(--cb-color-primary-600, #059669)" />
            <path d="M32 6.2L7.5 15.2L11.4 48.6L32 60.5L52.6 48.6L56.5 15.2L32 6.2Z" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1.5" />
            <path d="M32 13L18.5 41H24.2L27.1 34.4H36.9L39.8 41H45.5L32 13ZM29.3 29.2L32 22.8L34.7 29.2H29.3Z" fill="#ffffff" />
            <path d="M15 46.5C19.5 43.5 24.5 43.5 29 46.5C33.5 49.5 38.5 49.5 43 46.5C45.5 44.8 47.5 44.2 49.5 44.5" stroke="var(--cb-color-primary-200, #a7f3d0)" stroke-width="3.2" stroke-linecap="round" />
            <path d="M19 52.5C23 50 27.5 50 31.5 52.5C35.5 55 40 55 44.5 52.2" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" />
          </g>
          <text
            x="74"
            y="44"
            font-size="31"
            font-weight="800"
            letter-spacing="-0.03em"
            [attr.fill]="negative() ? '#ffffff' : 'var(--cb-color-text-strong, #0f172a)'"
          >
            {{ label() }}<tspan fill="var(--cb-color-primary-500, #10b981)">NG</tspan>
          </text>
        </svg>
      }
    }
  `,
  styleUrl: './logo.component.css',
})
export class CbLogo {
  readonly name = input<CbLogoFormat>('caribe-horizontal');
  readonly label = input<string>('Caribe');
  readonly size = input<string>('160px');
  readonly negative = input<boolean>(false);
  readonly alt = input<string>('Logo CaribeNG');

  protected readonly variant = computed<'horizontal' | 'icon' | 'vertical' | 'mono'>(() => {
    const n = (this.name() || '').toLowerCase();
    if (n.includes('icon') || n.includes('isotipo') || n.includes('shield')) return 'icon';
    if (n.includes('vertical') || n.includes('stacked')) return 'vertical';
    if (n.includes('mono')) return 'mono';
    return 'horizontal';
  });
}

import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output } from '@angular/core';

@Component({
  selector: 'cb-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-header', style: 'display: block; width: 100%' },
  template: `
    <header
      class="cb-caribe-surface"
      style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 0.75rem 1.25rem"
    >
      <div style="display: flex; align-items: center; gap: 0.75rem">
        @if (showBack()) {
          <button
            type="button"
            aria-label="Volver"
            (click)="backClick.emit()"
            style="border: none; background: transparent; cursor: pointer; font-size: 1rem; color: inherit"
          >
            ←
          </button>
        }
        <div>
          <strong style="font-size: 1rem; display: block">{{ title() }}</strong>
          @if (subtitle()) {
            <span style="font-size: 0.75rem; color: var(--cb-color-text-muted, #64748b)">{{ subtitle() }}</span>
          }
        </div>
      </div>
      <div>
        <ng-content />
      </div>
    </header>
  `,
  styleUrl: './header.component.css',
})
export class CbHeaderComponent {
  readonly title = input<string>('CaribeNG');
  readonly subtitle = input<string>('');
  readonly showBack = input<boolean>(false);
  readonly backClick = output<void>();
}

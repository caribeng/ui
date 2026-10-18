import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, model } from '@angular/core';

@Component({
  selector: 'cb-expansion-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-expansion-panel', style: 'display: block; width: 100%' },
  template: `
    <div class="cb-caribe-surface" style="display: flex; flex-direction: column; align-items: stretch; width: 100%">
      <button
        type="button"
        [attr.aria-expanded]="expanded()"
        (click)="expanded.set(!expanded())"
        style="display: flex; justify-content: space-between; align-items: center; width: 100%; border: none; background: transparent; color: inherit; font-weight: 600; cursor: pointer; padding: 0.25rem 0"
      >
        <span>{{ title() }}</span>
        <span aria-hidden="true">{{ expanded() ? '▾' : '▸' }}</span>
      </button>
      @if (expanded()) {
        <div style="padding-top: 0.5rem; border-top: 1px solid var(--cb-color-border, #e2e8f0); font-size: 0.875rem">
          <ng-content />
        </div>
      }
    </div>
  `,
  styleUrl: './expansion-panel.component.css',
})
export class CbExpansionPanel {
  readonly title = input<string>('Detalles');
  readonly expanded = model<boolean>(false);
}

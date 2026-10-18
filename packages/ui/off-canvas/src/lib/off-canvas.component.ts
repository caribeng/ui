import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, model } from '@angular/core';

@Component({
  selector: 'cb-off-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-off-canvas' },
  template: `
    @if (open()) {
      <aside
        class="cb-caribe-surface"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()"
        style="flex-direction: column; align-items: stretch; min-width: 280px; padding: 1rem"
      >
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem">
          <strong>{{ title() }}</strong>
          <button
            type="button"
            aria-label="Cerrar panel"
            (click)="open.set(false)"
            style="border: none; background: transparent; cursor: pointer; font-size: 1rem; color: inherit"
          >
            ×
          </button>
        </div>
        <div><ng-content /></div>
      </aside>
    }
  `,
  styleUrl: './off-canvas.component.css',
})
export class CbOffCanvasComponent {
  readonly title = input<string>('Panel lateral');
  readonly position = input<'left' | 'right' | 'bottom'>('right');
  readonly open = model<boolean>(false);
}

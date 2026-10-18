import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model } from '@angular/core';

@Component({
  selector: 'cb-dots-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-dots-indicator' },
  template: `
    <div role="tablist" aria-label="Indicador de páginas" style="display: inline-flex; gap: 0.4rem; align-items: center">
      @for (idx of indices(); track idx) {
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="activeIndex() === idx"
          [attr.aria-label]="'Página ' + (idx + 1)"
          (click)="activeIndex.set(idx)"
          [style.width]="activeIndex() === idx ? '1.4rem' : '0.5rem'"
          [style.background]="activeIndex() === idx ? 'var(--cb-color-primary-500, #10b981)' : 'var(--cb-color-surface-300, #cbd5e1)'"
          style="height: 0.5rem; border: none; border-radius: 999px; padding: 0; cursor: pointer; transition: width 150ms ease"
        ></button>
      }
    </div>
  `,
  styleUrl: './dots-indicator.component.css',
})
export class CbDotsIndicatorComponent {
  readonly count = input<number>(4);
  readonly activeIndex = model<number>(0);

  protected readonly indices = computed(() =>
    Array.from({ length: Math.max(1, this.count()) }, (_, i) => i)
  );
}

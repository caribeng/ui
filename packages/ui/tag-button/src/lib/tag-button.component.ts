import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, model } from '@angular/core';

@Component({
  selector: 'cb-tag-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-tag-button' },
  template: `
    <button
      type="button"
      [disabled]="disabled()"
      [attr.aria-pressed]="selected()"
      (click)="toggle()"
      [style.background]="selected() ? 'var(--cb-color-primary-500, #10b981)' : 'var(--cb-color-surface, #f8fafc)'"
      [style.color]="selected() ? '#ffffff' : 'inherit'"
      style="padding: 0.35rem 0.85rem; border-radius: 999px; border: 1px solid var(--cb-color-border, #cbd5e1); font-size: 0.8rem; font-weight: 500; cursor: pointer"
    >
      {{ label() }}
    </button>
  `,
  styleUrl: './tag-button.component.css',
})
export class CbTagButtonComponent {
  readonly label = input<string>('Filtro');
  readonly disabled = input<boolean>(false);
  readonly selected = model<boolean>(false);

  toggle(): void {
    if (this.disabled()) return;
    this.selected.update((v) => !v);
  }
}

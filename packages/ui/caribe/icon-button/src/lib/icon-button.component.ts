import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output } from '@angular/core';
import { CbIconComponent } from '@caribeng/ui/icon';

@Component({
  selector: 'cb-icon-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIconComponent],
  host: { class: 'cb-icon-button' },
  template: `
    <button
      type="button"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel() || icon()"
      (click)="!disabled() && pressed.emit($event)"
      style="display: inline-flex; align-items: center; justify-content: center; width: 2.25rem; height: 2.25rem; border-radius: 999px; border: 1px solid var(--cb-color-border, #cbd5e1); background: var(--cb-color-surface, #fff); color: var(--cb-color-text-strong, #0f172a); cursor: pointer"
    >
      <cb-icon [name]="icon()" [size]="18" aria-hidden="true" />
    </button>
  `,
  styleUrl: './icon-button.component.css',
})
export class CbIconButton {
  readonly icon = input<string>('plus');
  readonly ariaLabel = input<string>('Acción');
  readonly disabled = input<boolean>(false);
  readonly pressed = output<MouseEvent>();
}

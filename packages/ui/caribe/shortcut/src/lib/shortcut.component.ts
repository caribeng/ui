import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output } from '@angular/core';
import { CbIconComponent } from '@caribeng/ui/icon';

@Component({
  selector: 'cb-shortcut',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIconComponent],
  host: { class: 'cb-shortcut' },
  template: `
    <button
      type="button"
      class="cb-caribe-surface"
      [disabled]="disabled()"
      (click)="!disabled() && action.emit()"
      style="flex-direction: column; justify-content: center; min-width: 96px; padding: 0.75rem 1rem; cursor: pointer"
    >
      <cb-icon [name]="icon()" [size]="22" aria-hidden="true" />
      <span style="font-size: 0.78rem; font-weight: 600">{{ label() }}</span>
    </button>
  `,
  styleUrl: './shortcut.component.css',
})
export class CbShortcut {
  readonly label = input<string>('Transferir');
  readonly icon = input<string>('arrow-right');
  readonly disabled = input<boolean>(false);
  readonly action = output<void>();
}

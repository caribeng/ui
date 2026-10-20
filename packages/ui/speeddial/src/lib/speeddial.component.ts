import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { injectCbTranslation } from '@caribeng/ui';

export type CbSpeedDialDirection = 'up' | 'down' | 'left' | 'right';

export interface CbSpeedDialItem {
  label: string;
  icon: string;
  disabled?: boolean;
}

@Component({
  selector: 'cb-speed-dial',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbIcon],
  host: {
    class: 'cb-speed-dial',
    '[class.cb-speed-dial--up]': 'direction() === "up"',
    '[class.cb-speed-dial--down]': 'direction() === "down"',
    '[class.cb-speed-dial--left]': 'direction() === "left"',
    '[class.cb-speed-dial--right]': 'direction() === "right"',
    '[class.cb-speed-dial--open]': 'open()',
  },
  template: `
    <div class="cb-speed-dial__actions" [attr.aria-hidden]="!open()">
      @if (open()) {
        @for (item of items(); track $index) {
          <button
            class="cb-speed-dial__action"
            type="button"
            [disabled]="item.disabled"
            [attr.aria-label]="item.label"
            [attr.title]="item.label"
            (click)="select(item)"
          ><cb-icon [name]="item.icon" [size]="18" aria-hidden="true" /></button>
        }
      }
    </div>
    <button
      class="cb-speed-dial__trigger"
      type="button"
      [attr.aria-expanded]="open()"
      [attr.aria-label]="open() ? (closeLabel() ?? t().closeActions) : (openLabel() ?? t().openActions)"
      (click)="open.set(!open())"
    ><cb-icon [name]="open() ? closeIcon() : icon()" [size]="20" aria-hidden="true" /></button>
  `,
  styleUrl: './speeddial.component.css',
})
export class CbSpeedDial {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly items = input<readonly CbSpeedDialItem[]>([]);
  readonly direction = input<CbSpeedDialDirection>('up');
  readonly icon = input('plus');
  readonly closeIcon = input('x');
  readonly openLabel = input<string | undefined>(undefined);
  readonly closeLabel = input<string | undefined>(undefined);
  readonly open = model(false);
  readonly itemSelect = output<CbSpeedDialItem>();

  protected select(item: CbSpeedDialItem): void {
    if (item.disabled) return;
    this.itemSelect.emit(item);
    this.open.set(false);
  }
}

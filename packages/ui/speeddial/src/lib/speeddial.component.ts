import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { CbIconComponent } from '@caribeng/ui/icon';

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
  imports: [CbIconComponent],
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
      [attr.aria-label]="open() ? closeLabel() : openLabel()"
      (click)="open.set(!open())"
    ><cb-icon [name]="open() ? closeIcon() : icon()" [size]="20" aria-hidden="true" /></button>
  `,
  styleUrl: './speeddial.component.css',
})
export class CbSpeedDialComponent {
  readonly items = input<readonly CbSpeedDialItem[]>([]);
  readonly direction = input<CbSpeedDialDirection>('up');
  readonly icon = input('plus');
  readonly closeIcon = input('x');
  readonly openLabel = input('Abrir acciones');
  readonly closeLabel = input('Cerrar acciones');
  readonly open = model(false);
  readonly itemSelect = output<CbSpeedDialItem>();

  protected select(item: CbSpeedDialItem): void {
    if (item.disabled) return;
    this.itemSelect.emit(item);
    this.open.set(false);
  }
}

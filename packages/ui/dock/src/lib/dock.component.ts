import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output } from '@angular/core';
import { CbIconComponent } from '@caribeng/ui/icon';

export type CbDockPosition = 'top' | 'right' | 'bottom' | 'left';
export interface CbDockItem { label: string; icon: string; url?: string; disabled?: boolean; }

/** Compact application launcher with configurable orientation. */
@Component({
  selector: 'cb-dock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIconComponent],
  host: {
    class: 'cb-dock',
    '[class.cb-dock--top]': 'position() === "top"',
    '[class.cb-dock--right]': 'position() === "right"',
    '[class.cb-dock--bottom]': 'position() === "bottom"',
    '[class.cb-dock--left]': 'position() === "left"',
  },
  template: `
    <nav [attr.aria-label]="ariaLabel()">
      <ul class="cb-dock__list" role="toolbar" [attr.aria-orientation]="position() === 'left' || position() === 'right' ? 'vertical' : 'horizontal'">
        @for (item of items(); track $index) {
          <li>
            @if (item.url && !item.disabled) {
              <a class="cb-dock__item" [href]="item.url" [attr.aria-label]="item.label" [title]="item.label" (click)="select(item)"><cb-icon [name]="item.icon" [size]="22" aria-hidden="true" /></a>
            } @else {
              <button class="cb-dock__item" type="button" [disabled]="item.disabled" [attr.aria-label]="item.label" [title]="item.label" (click)="select(item)"><cb-icon [name]="item.icon" [size]="22" aria-hidden="true" /></button>
            }
          </li>
        }
      </ul>
    </nav>
  `,
  styleUrl: './dock.component.css',
})
export class CbDockComponent {
  readonly items = input<readonly CbDockItem[]>([]);
  readonly position = input<CbDockPosition>('bottom');
  readonly ariaLabel = input('Application dock');
  readonly itemSelect = output<CbDockItem>();
  select(item: CbDockItem): void { if (!item.disabled) this.itemSelect.emit(item); }
}

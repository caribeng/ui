import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, model, output } from '@angular/core';
import { CbIconComponent } from '@caribeng/ui/icon';

export interface CbTabMenuItem {
  label: string;
  url?: string;
  icon?: string;
  disabled?: boolean;
}

/** Horizontal navigation menu with an active item. */
@Component({
  selector: 'cb-tabmenu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIconComponent],
  host: { class: 'cb-tabmenu' },
  template: `
    <nav [attr.aria-label]="ariaLabel()">
      <ul class="cb-tabmenu__list">
        @for (item of items(); track $index; let i = $index) {
          <li class="cb-tabmenu__entry">
            @if (item.url && !item.disabled) {
              <a class="cb-tabmenu__link" [href]="item.url" [attr.aria-current]="activeIndex() === i ? 'page' : null" [attr.tabindex]="item.disabled ? -1 : 0" (click)="select(item, i)">
                @if (item.icon) { <cb-icon [name]="item.icon" [size]="16" aria-hidden="true" /> }
                <span>{{ item.label }}</span>
              </a>
            } @else {
              <button class="cb-tabmenu__link" type="button" [disabled]="item.disabled" [attr.aria-current]="activeIndex() === i ? 'page' : null" (click)="select(item, i)">
                @if (item.icon) { <cb-icon [name]="item.icon" [size]="16" aria-hidden="true" /> }
                <span>{{ item.label }}</span>
              </button>
            }
          </li>
        }
      </ul>
    </nav>
  `,
  styleUrl: './tabmenu.component.css',
})
export class CbTabMenuComponent {
  readonly items = input<readonly CbTabMenuItem[]>([]);
  readonly activeIndex = model(0);
  readonly ariaLabel = input('Section navigation');
  readonly itemSelect = output<CbTabMenuItem>();

  select(item: CbTabMenuItem, index: number): void {
    if (item.disabled) return;
    this.activeIndex.set(index);
    this.itemSelect.emit(item);
  }
}

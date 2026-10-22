import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, model, output, computed } from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { cbRunCommand, cbVisibleItems, injectCbTranslation, type CbMenuCommandEvent } from '@caribeng/ui';

export interface CbTabMenuItem {
  label: string;
  url?: string;
  icon?: string;
  disabled?: boolean;
  /** Acción al elegir el item (además del evento de selección), como `command` en PrimeNG. */
  command?: (event: CbMenuCommandEvent<CbTabMenuItem>) => void;
  /** `false` oculta el item. */
  visible?: boolean;
}

/** Horizontal navigation menu with an active item. */
@Component({
  selector: 'cb-tabmenu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-tabmenu' },
  template: `
    <nav [attr.aria-label]="(ariaLabel() ?? t().sectionNavigation)">
      <ul class="cb-tabmenu__list">
        @for (item of visibleItems(); track $index; let i = $index) {
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
export class CbTabMenu {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly items = input<readonly CbTabMenuItem[]>([]);
  /** Items sin los de `visible: false`. */
  protected readonly visibleItems = computed(() => cbVisibleItems(this.items()));
  readonly activeIndex = model(0);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly itemSelect = output<CbTabMenuItem>();

  select(item: CbTabMenuItem, index: number): void {
    if (item.disabled) return;
    this.activeIndex.set(index);
    cbRunCommand(item);
    this.itemSelect.emit(item);
  }
}

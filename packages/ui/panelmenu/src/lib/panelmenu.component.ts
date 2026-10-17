import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output, signal } from '@angular/core';
import { CbIconComponent } from '@caribeng/ui/icon';

export interface CbPanelMenuItem {
  label: string;
  icon?: string;
  url?: string;
  disabled?: boolean;
  items?: readonly CbPanelMenuItem[];
}

let nextPanelMenuId = 0;

/** Vertical menu with collapsible sections. */
@Component({
  selector: 'cb-panelmenu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIconComponent],
  host: { class: 'cb-panelmenu' },
  template: `
    <nav [attr.aria-label]="ariaLabel()">
      <ul class="cb-panelmenu__list">
        @for (item of items(); track $index; let i = $index) {
          <li class="cb-panelmenu__entry">
            @if (item.items?.length) {
              <button class="cb-panelmenu__trigger" type="button" [disabled]="item.disabled" [attr.aria-expanded]="isOpen(i)" [attr.aria-controls]="panelId(i)" (click)="toggle(i)">
                @if (item.icon) { <cb-icon [name]="item.icon" [size]="16" aria-hidden="true" /> }
                <span>{{ item.label }}</span>
                <cb-icon class="cb-panelmenu__chevron" [class.cb-panelmenu__chevron--open]="isOpen(i)" name="chevron-down" [size]="16" aria-hidden="true" />
              </button>
              @if (isOpen(i)) {
                <ul class="cb-panelmenu__children" [id]="panelId(i)">
                  @for (child of item.items; track $index) {
                    <li>
                      @if (child.url && !child.disabled) {
                        <a class="cb-panelmenu__child" [href]="child.url" (click)="select(child)">
                          @if (child.icon) { <cb-icon [name]="child.icon" [size]="16" aria-hidden="true" /> }<span>{{ child.label }}</span>
                        </a>
                      } @else {
                        <button class="cb-panelmenu__child" type="button" [disabled]="child.disabled" (click)="select(child)">
                          @if (child.icon) { <cb-icon [name]="child.icon" [size]="16" aria-hidden="true" /> }<span>{{ child.label }}</span>
                        </button>
                      }
                    </li>
                  }
                </ul>
              }
            } @else if (item.url && !item.disabled) {
              <a class="cb-panelmenu__trigger" [href]="item.url" (click)="select(item)">
                @if (item.icon) { <cb-icon [name]="item.icon" [size]="16" aria-hidden="true" /> }<span>{{ item.label }}</span>
              </a>
            } @else {
              <button class="cb-panelmenu__trigger" type="button" [disabled]="item.disabled" (click)="select(item)">
                @if (item.icon) { <cb-icon [name]="item.icon" [size]="16" aria-hidden="true" /> }<span>{{ item.label }}</span>
              </button>
            }
          </li>
        }
      </ul>
    </nav>
  `,
  styleUrl: './panelmenu.component.css',
})
export class CbPanelMenuComponent {
  private readonly uid = ++nextPanelMenuId;
  readonly items = input<readonly CbPanelMenuItem[]>([]);
  readonly ariaLabel = input('Panel menu');
  readonly multiple = input(false);
  readonly itemSelect = output<CbPanelMenuItem>();
  private readonly openItems = signal<ReadonlySet<number>>(new Set());

  isOpen(index: number): boolean { return this.openItems().has(index); }
  panelId(index: number): string { return `cb-panelmenu-${this.uid}-panel-${index}`; }

  toggle(index: number): void {
    const current = this.openItems();
    const next = new Set(this.multiple() ? current : []);
    if (current.has(index)) next.delete(index); else next.add(index);
    this.openItems.set(next);
  }

  select(item: CbPanelMenuItem): void { if (!item.disabled) this.itemSelect.emit(item); }
}

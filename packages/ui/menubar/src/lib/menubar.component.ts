import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';

export interface CbMenubarItem {
  label: string;
  icon?: string;
  url?: string;
  target?: string;
  disabled?: boolean;
  items?: readonly CbMenubarItem[];
}

/** Horizontal navigation bar with optional one-level dropdown menus. */
@Component({
  selector: 'cb-menubar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-menubar',
    '(keydown)': 'onKeydown($event)',
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    <nav [attr.aria-label]="ariaLabel()">
      <ul class="cb-menubar__list" role="menubar">
        @for (item of items(); track $index; let i = $index) {
          <li class="cb-menubar__entry" role="none">
            @if (item.items?.length) {
              <button
                class="cb-menubar__trigger"
                type="button"
                role="menuitem"
                aria-haspopup="menu"
                [attr.aria-expanded]="openIndex() === i"
                [disabled]="item.disabled"
                (click)="toggle(i)"
              >
                @if (item.icon) { <cb-icon [name]="item.icon" [size]="16" aria-hidden="true" /> }
                <span>{{ item.label }}</span>
                <cb-icon class="cb-menubar__chevron" [class.cb-menubar__chevron--open]="openIndex() === i" name="chevron-down" [size]="14" aria-hidden="true" />
              </button>
              @if (openIndex() === i) {
                <ul class="cb-menubar__submenu" role="menu" [attr.aria-label]="item.label">
                  @for (child of item.items; track $index) {
                    <li role="none">
                      @if (child.url) {
                        <a class="cb-menubar__submenu-item" role="menuitem" [href]="child.disabled ? null : child.url" [attr.target]="child.target || null" [attr.aria-disabled]="child.disabled ? 'true' : null" [attr.tabindex]="child.disabled ? -1 : 0" (click)="select(child, $event, i)">
                          @if (child.icon) { <cb-icon [name]="child.icon" [size]="16" aria-hidden="true" /> }
                          <span>{{ child.label }}</span>
                        </a>
                      } @else {
                        <button class="cb-menubar__submenu-item" type="button" role="menuitem" [disabled]="child.disabled" (click)="select(child, $event, i)">
                          @if (child.icon) { <cb-icon [name]="child.icon" [size]="16" aria-hidden="true" /> }
                          <span>{{ child.label }}</span>
                        </button>
                      }
                    </li>
                  }
                </ul>
              }
            } @else if (item.url) {
              <a class="cb-menubar__trigger" role="menuitem" [href]="item.disabled ? null : item.url" [attr.target]="item.target || null" [attr.aria-disabled]="item.disabled ? 'true' : null" [attr.tabindex]="item.disabled ? -1 : 0" (click)="select(item, $event, i)">
                @if (item.icon) { <cb-icon [name]="item.icon" [size]="16" aria-hidden="true" /> }
                <span>{{ item.label }}</span>
              </a>
            } @else {
              <button class="cb-menubar__trigger" type="button" role="menuitem" [disabled]="item.disabled" (click)="select(item, $event, i)">
                @if (item.icon) { <cb-icon [name]="item.icon" [size]="16" aria-hidden="true" /> }
                <span>{{ item.label }}</span>
              </button>
            }
          </li>
        }
      </ul>
    </nav>
  `,
  styleUrl: './menubar.component.css',
})
export class CbMenubar {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly items = input<readonly CbMenubarItem[]>([]);
  readonly ariaLabel = input('Main navigation');
  readonly itemSelect = output<CbMenubarItem>();
  protected readonly openIndex = signal<number | null>(null);

  toggle(index: number): void {
    this.openIndex.update((current) => current === index ? null : index);
  }

  select(item: CbMenubarItem, event: MouseEvent, parentIndex?: number): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    this.itemSelect.emit(item);
    if (parentIndex !== undefined) this.openIndex.set(null);
  }

  onDocumentClick(event: MouseEvent): void {
    if (!(this.host.nativeElement as HTMLElement).contains(event.target as Node)) this.openIndex.set(null);
  }

  onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const entries: HTMLElement[] = Array.from((this.host.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.cb-menubar__list > .cb-menubar__entry'));
    const root = target.closest('.cb-menubar__list > .cb-menubar__entry > [role="menuitem"]') as HTMLElement | null;
    const rootIndex = root ? entries.findIndex((entry) => entry.contains(root)) : -1;

    if (event.key === 'Escape' && this.openIndex() !== null) {
      event.preventDefault();
      const index = this.openIndex()!;
      this.openIndex.set(null);
      entries[index]?.querySelector<HTMLElement>(':scope > [role="menuitem"]')?.focus();
      return;
    }

    if (root && rootIndex >= 0 && (event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'Home' || event.key === 'End')) {
      event.preventDefault();
      const enabled = entries.map((entry) => ({ item: entry.querySelector<HTMLElement>(':scope > [role="menuitem"]') }))
        .filter(({ item }) => item && !item.hasAttribute('disabled') && item.getAttribute('aria-disabled') !== 'true');
      const current = enabled.findIndex(({ item }) => item === root);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1
        : (current + (event.key === 'ArrowRight' ? 1 : -1) + enabled.length) % enabled.length;
      enabled[next]?.item?.focus();
      this.openIndex.set(null);
      return;
    }

    if (event.key === 'ArrowDown' && root && this.items()[rootIndex]?.items?.length) {
      event.preventDefault();
      this.openIndex.set(rootIndex);
      queueMicrotask(() => (this.host.nativeElement as HTMLElement).querySelector<HTMLElement>('.cb-menubar__submenu [role="menuitem"]:not([aria-disabled="true"]):not(:disabled)')?.focus());
    }

    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && target.closest('.cb-menubar__submenu')) {
      const children = Array.from(target.closest('.cb-menubar__submenu')!.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"]):not(:disabled)'));
      const index = children.indexOf(target.closest('[role="menuitem"]') as HTMLElement);
      const next = (index + (event.key === 'ArrowDown' ? 1 : -1) + children.length) % children.length;
      event.preventDefault();
      children[next]?.focus();
    }
  }

}

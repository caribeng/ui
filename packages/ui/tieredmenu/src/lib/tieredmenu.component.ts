import { ChangeDetectionStrategy, Component, DestroyRef, TemplateRef, ViewContainerRef, ViewEncapsulation, inject, input, output, signal, viewChild } from '@angular/core';
import { Overlay, type ConnectedPosition, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CbIcon } from '@caribeng/ui/icon';
import { injectCbTranslation } from '@caribeng/ui';

export interface CbTieredMenuItem {
  label: string;
  icon?: string;
  url?: string;
  disabled?: boolean;
  separator?: boolean;
  items?: readonly CbTieredMenuItem[];
}

/** Popup menu with cascading submenus. */
@Component({
  selector: 'cb-tieredmenu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  template: `
    <button class="cb-tieredmenu__trigger" type="button" [attr.aria-expanded]="isOpen()" aria-haspopup="menu" (click)="toggle($event)">{{ (triggerLabel() ?? t().menu) }}</button>
    <ng-template #content>
      <ul class="cb-tieredmenu__list" role="menu" [attr.aria-label]="(ariaLabel() ?? t().menu)">
        @for (item of items(); track $index; let i = $index) {
          @if (item.separator) { <li class="cb-tieredmenu__separator" role="separator"></li> }
          @else {
            <li class="cb-tieredmenu__entry" [class.cb-tieredmenu__entry--open]="openIndex() === i">
              @if (item.items?.length) {
                <button class="cb-tieredmenu__item" type="button" role="menuitem" aria-haspopup="menu" [attr.aria-expanded]="openIndex() === i" [disabled]="item.disabled" (mouseenter)="openIndex.set(i)" (click)="openIndex.set(openIndex() === i ? null : i)">
                  @if (item.icon) { <cb-icon [name]="item.icon" [size]="16" aria-hidden="true" /> }<span>{{ item.label }}</span><cb-icon name="chevron-right" [size]="15" aria-hidden="true" />
                </button>
                @if (openIndex() === i) {
                  <ul class="cb-tieredmenu__submenu" role="menu" [attr.aria-label]="item.label">
                    @for (child of item.items; track $index; let j = $index) {
                      <li role="none">
                        @if (child.items?.length) {
                          <button class="cb-tieredmenu__item" type="button" role="menuitem" aria-haspopup="menu" [attr.aria-expanded]="openChildIndex() === j" [disabled]="child.disabled" (mouseenter)="openChildIndex.set(j)" (click)="openChildIndex.set(openChildIndex() === j ? null : j)">
                            @if (child.icon) { <cb-icon [name]="child.icon" [size]="16" aria-hidden="true" /> }<span>{{ child.label }}</span><cb-icon name="chevron-right" [size]="15" aria-hidden="true" />
                          </button>
                          @if (openChildIndex() === j) {
                            <ul class="cb-tieredmenu__submenu cb-tieredmenu__submenu--third" role="menu" [attr.aria-label]="child.label">
                              @for (leaf of child.items; track $index) { <li role="none"><button class="cb-tieredmenu__item" type="button" role="menuitem" [disabled]="leaf.disabled" (click)="select(leaf)">{{ leaf.label }}</button></li> }
                            </ul>
                          }
                        } @else {
                          <button class="cb-tieredmenu__item" type="button" role="menuitem" [disabled]="child.disabled" (click)="select(child)">
                            @if (child.icon) { <cb-icon [name]="child.icon" [size]="16" aria-hidden="true" /> }<span>{{ child.label }}</span>
                          </button>
                        }
                      </li>
                    }
                  </ul>
                }
              } @else {
                <button class="cb-tieredmenu__item" type="button" role="menuitem" [disabled]="item.disabled" (click)="select(item)">
                  @if (item.icon) { <cb-icon [name]="item.icon" [size]="16" aria-hidden="true" /> }<span>{{ item.label }}</span>
                </button>
              }
            </li>
          }
        }
      </ul>
    </ng-template>
  `,
  styleUrl: './tieredmenu.component.css',
})
export class CbTieredMenu {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  readonly items = input<readonly CbTieredMenuItem[]>([]);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly triggerLabel = input<string | undefined>(undefined);
  readonly itemSelect = output<CbTieredMenuItem>();
  protected readonly isOpen = signal(false);
  protected readonly openIndex = signal<number | null>(null);
  protected readonly openChildIndex = signal<number | null>(null);
  private readonly content = viewChild.required<TemplateRef<unknown>>('content');
  private overlayRef: OverlayRef | null = null;
  private readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
  ];
  constructor() { this.destroyRef.onDestroy(() => this.overlayRef?.dispose()); }
  toggle(event: MouseEvent): void { if (this.overlayRef) this.hide(); else this.show(event.currentTarget as HTMLElement); }
  show(target: HTMLElement): void {
    if (this.overlayRef) return;
    const ref = this.overlay.create({ positionStrategy: this.overlay.position().flexibleConnectedTo(target).withPositions(this.positions).withPush(true), scrollStrategy: this.overlay.scrollStrategies.reposition(), hasBackdrop: true, backdropClass: 'cdk-overlay-transparent-backdrop' });
    this.overlayRef = ref; this.isOpen.set(true); ref.attach(new TemplatePortal(this.content(), this.vcr));
    ref.backdropClick().subscribe(() => this.hide());
    ref.keydownEvents().subscribe((event) => { if (event.key === 'Escape') { event.preventDefault(); this.hide(); } });
  }
  select(item: CbTieredMenuItem): void { if (item.disabled) return; this.itemSelect.emit(item); this.hide(); }
  hide(): void { this.overlayRef?.dispose(); this.overlayRef = null; this.isOpen.set(false); this.openIndex.set(null); this.openChildIndex.set(null); }
}

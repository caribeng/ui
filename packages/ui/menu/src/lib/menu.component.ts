import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Overlay, type ConnectedPosition, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CbIconComponent } from '@caribeng/ui/icon';

export interface CbMenuItem {
  label: string;
  icon?: string;
  url?: string;
  target?: string;
  disabled?: boolean;
  separator?: boolean;
}

/** Popup menu anchored to any trigger element. */
@Component({
  selector: 'cb-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIconComponent],
  template: `
    <ng-template #content>
      <div class="cb-menu__panel" role="menu" [attr.aria-label]="ariaLabel() || null" (click)="onPanelClick($event)">
        @for (item of items(); track $index) {
          @if (item.separator) {
            <div class="cb-menu__separator" role="separator"></div>
          } @else {
            @if (item.url) {
              <a
                class="cb-menu__item"
                role="menuitem"
                [href]="item.disabled ? null : item.url"
                [attr.target]="item.target || null"
                [attr.aria-disabled]="item.disabled ? 'true' : null"
                [attr.tabindex]="item.disabled ? -1 : 0"
                (click)="activate(item, $event)"
              >
                @if (item.icon) { <cb-icon [name]="item.icon" [size]="16" aria-hidden="true" /> }
                <span>{{ item.label }}</span>
              </a>
            } @else {
              <button
                class="cb-menu__item"
                type="button"
                role="menuitem"
                [disabled]="item.disabled"
                (click)="activate(item, $event)"
              >
                @if (item.icon) { <cb-icon [name]="item.icon" [size]="16" aria-hidden="true" /> }
                <span>{{ item.label }}</span>
              </button>
            }
          }
        }
      </div>
    </ng-template>
  `,
  styleUrl: './menu.component.css',
})
export class CbMenuComponent {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly items = input<readonly CbMenuItem[]>([]);
  readonly ariaLabel = input('Menu');
  readonly itemSelect = output<CbMenuItem>();

  private readonly content = viewChild.required<TemplateRef<unknown>>('content');
  private overlayRef: OverlayRef | null = null;
  private trigger: HTMLElement | null = null;

  private readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 },
  ];

  constructor() {
    this.destroyRef.onDestroy(() => this.overlayRef?.dispose());
  }

  get isOpen(): boolean {
    return this.overlayRef !== null;
  }

  toggle(event: MouseEvent): void {
    if (this.overlayRef) this.hide();
    else this.show(event.currentTarget as HTMLElement);
  }

  show(target: HTMLElement): void {
    if (this.overlayRef) return;
    this.trigger = target;
    const ref = this.overlay.create({
      positionStrategy: this.overlay.position().flexibleConnectedTo(target).withPositions(this.positions).withPush(true),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });
    this.overlayRef = ref;
    ref.attach(new TemplatePortal(this.content(), this.vcr));
    ref.backdropClick().subscribe(() => this.hide());
    ref.keydownEvents().subscribe((event) => this.onKeydown(event));
    queueMicrotask(() => ref.overlayElement.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"]):not(:disabled)')?.focus());
  }

  hide(): void {
    if (!this.overlayRef) return;
    this.overlayRef.dispose();
    this.overlayRef = null;
    const trigger = this.trigger;
    this.trigger = null;
    trigger?.focus();
  }

  activate(item: CbMenuItem, event: MouseEvent): void {
    if (item.disabled || item.separator) {
      event.preventDefault();
      return;
    }
    this.itemSelect.emit(item);
    this.hide();
  }

  onPanelClick(event: MouseEvent): void {
    const anchor = (event.target as HTMLElement).closest('a[role="menuitem"]');
    if (anchor?.getAttribute('aria-disabled') === 'true') event.preventDefault();
  }

  private onKeydown(event: KeyboardEvent): void {
    const panel = this.overlayRef?.overlayElement.querySelector<HTMLElement>('[role="menu"]');
    if (!panel) return;
    const items = Array.from(panel.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"]):not(:disabled)'));
    const index = items.indexOf(panel.ownerDocument.activeElement as HTMLElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      this.hide();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
        : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items[next]?.focus();
    }
  }
}

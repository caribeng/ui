import { ChangeDetectionStrategy, Component, DestroyRef, TemplateRef, ViewContainerRef, ViewEncapsulation, inject, input, output, viewChild } from '@angular/core';
import { Overlay, type ConnectedPosition, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CbIconComponent } from '@caribeng/ui/icon';

export interface CbContextMenuItem {
  label: string;
  icon?: string;
  disabled?: boolean;
  separator?: boolean;
}

/** Context menu that opens at the pointer position on right click. */
@Component({
  selector: 'cb-contextmenu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIconComponent],
  host: { class: 'cb-contextmenu', '(contextmenu)': 'open($event)' },
  template: `
    <ng-content />
    <ng-template #content>
      <div class="cb-contextmenu__panel" role="menu" [attr.aria-label]="ariaLabel()">
        @for (item of items(); track $index) {
          @if (item.separator) { <div class="cb-contextmenu__separator" role="separator"></div> }
          @else {
            <button class="cb-contextmenu__item" type="button" role="menuitem" [disabled]="item.disabled" (click)="select(item)">
              @if (item.icon) { <cb-icon [name]="item.icon" [size]="16" aria-hidden="true" /> }
              <span>{{ item.label }}</span>
            </button>
          }
        }
      </div>
    </ng-template>
  `,
  styleUrl: './contextmenu.component.css',
})
export class CbContextMenuComponent {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  readonly items = input<readonly CbContextMenuItem[]>([]);
  readonly ariaLabel = input('Context menu');
  readonly itemSelect = output<CbContextMenuItem>();
  private readonly content = viewChild.required<TemplateRef<unknown>>('content');
  private overlayRef: OverlayRef | null = null;
  private readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'top' },
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'bottom' },
  ];

  constructor() { this.destroyRef.onDestroy(() => this.overlayRef?.dispose()); }

  open(event: MouseEvent): void {
    event.preventDefault();
    this.close();
    const ref = this.overlay.create({
      positionStrategy: this.overlay.position().flexibleConnectedTo({ x: event.clientX, y: event.clientY }).withPositions(this.positions).withPush(true),
      scrollStrategy: this.overlay.scrollStrategies.close(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });
    this.overlayRef = ref;
    ref.attach(new TemplatePortal(this.content(), this.vcr));
    ref.backdropClick().subscribe(() => this.close());
    ref.keydownEvents().subscribe((keyEvent) => {
      if (keyEvent.key === 'Escape') { keyEvent.preventDefault(); this.close(); }
      else if (keyEvent.key === 'ArrowDown' || keyEvent.key === 'ArrowUp') {
        const options = Array.from(ref.overlayElement.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)'));
        const index = options.indexOf(ref.overlayElement.ownerDocument.activeElement as HTMLElement);
        const next = index < 0 ? 0 : (index + (keyEvent.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        keyEvent.preventDefault(); options[next]?.focus();
      }
    });
    queueMicrotask(() => ref.overlayElement.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')?.focus());
  }

  select(item: CbContextMenuItem): void {
    if (item.disabled || item.separator) return;
    this.itemSelect.emit(item);
    this.close();
  }

  close(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}

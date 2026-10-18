import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import {
  Overlay,
  type OverlayRef,
  type ConnectedPosition,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

/**
 * Popover de CaribeNG: panel flotante con contenido proyectado, anclado a un
 * elemento disparador. El consumidor lo abre con `toggle($event)`.
 *
 * @example
 * ```html
 * <cb-button (click)="op.toggle($event)">Opciones</cb-button>
 * <cb-popover #op>
 *   <div style="padding: 1rem">Contenido del popover…</div>
 * </cb-popover>
 * ```
 */
@Component({
  selector: 'cb-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <ng-template #content>
      <div class="cb-popover__panel" role="dialog" [attr.aria-label]="ariaLabel() || null">
        <ng-content />
      </div>
    </ng-template>
  `,
  styleUrl: './popover.component.css',
})
export class CbPopover {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);

  /** Cierra al hacer clic fuera. */
  readonly dismissable = input<boolean, unknown>(true, { transform: toBoolean });
  /** Nombre accesible del panel. */
  readonly ariaLabel = input<string>('');

  readonly onShow = output<void>();
  readonly onHide = output<void>();

  private readonly content = viewChild.required<TemplateRef<unknown>>('content');
  private overlayRef: OverlayRef | null = null;

  private readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -6 },
  ];

  /** Abre si está cerrado, cierra si está abierto. */
  toggle(event: MouseEvent): void {
    if (this.overlayRef) {
      this.hide();
    } else {
      this.show(event.currentTarget as HTMLElement);
    }
  }

  /** Abre el popover anclado a `target`. */
  show(target: HTMLElement): void {
    if (this.overlayRef) return;

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(target)
        .withPositions(this.positions)
        .withPush(false),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });

    this.overlayRef.attach(new TemplatePortal(this.content(), this.vcr));
    this.overlayRef.backdropClick().subscribe(() => {
      if (this.dismissable()) this.hide();
    });
    this.overlayRef.keydownEvents().subscribe((e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.hide();
      }
    });
    this.onShow.emit();
  }

  /** Cierra el popover. */
  hide(): void {
    if (!this.overlayRef) return;
    this.overlayRef.dispose();
    this.overlayRef = null;
    this.onHide.emit();
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}

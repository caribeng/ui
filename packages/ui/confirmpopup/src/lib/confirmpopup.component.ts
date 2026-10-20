import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  Injector,
} from '@angular/core';
import { Overlay, type ConnectedPosition, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { injectCbTranslation } from '@caribeng/ui';
import { CbButton } from '@caribeng/ui/button';

let nextUid = 0;

/**
 * Confirmación breve de CaribeNG. Ábrela anclada al botón que la dispara con
 * `confirm($event)` (como PrimeNG), o en línea con `[(visible)]`. Escape o un
 * clic fuera la cancelan; el foco vuelve al disparador al cerrarse.
 *
 * @example
 * ```html
 * <cb-button severity="danger" (click)="borrar.confirm($event)">Eliminar</cb-button>
 * <cb-confirm-popup #borrar message="¿Eliminar este archivo?" (accepted)="eliminar()" />
 * ```
 */
@Component({
  selector: 'cb-confirm-popup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [NgTemplateOutlet, CbButton],
  host: { class: 'cb-confirm-popup-host' },
  template: `
    @if (visible() && !anchored()) {
      <ng-container *ngTemplateOutlet="panel" />
    }

    <ng-template #panel>
      <section
        class="cb-confirm-popup"
        role="alertdialog"
        aria-modal="false"
        [attr.aria-describedby]="messageId"
        (keydown.escape)="reject()"
      >
        <p class="cb-confirm-popup__message" [id]="messageId">{{ message() ?? t().confirmMessage }}</p>
        <div class="cb-confirm-popup__actions">
          <cb-button size="sm" variant="text" severity="secondary" (click)="reject()">
            {{ rejectLabel() ?? t().cancel }}
          </cb-button>
          <cb-button size="sm" [severity]="acceptSeverity()" (click)="accept()">
            {{ acceptLabel() ?? t().accept }}
          </cb-button>
        </div>
      </section>
    </ng-template>
  `,
  styleUrl: './confirmpopup.component.css',
})
export class CbConfirmPopup {
  protected readonly t = injectCbTranslation();
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  protected readonly messageId = `cb-confirm-popup-${++nextUid}-message`;

  /** Visibilidad (two-way). Con `[(visible)]` se muestra en línea. */
  readonly visible = model(false);
  /** Pregunta a confirmar. Por defecto, la del idioma activo. */
  readonly message = input<string | undefined>(undefined);
  readonly acceptLabel = input<string | undefined>(undefined);
  readonly rejectLabel = input<string | undefined>(undefined);
  /** Severidad del botón de aceptar (p. ej. `danger` para acciones destructivas). */
  readonly acceptSeverity = input<'primary' | 'danger' | 'success' | 'warning'>('primary');

  readonly accepted = output<void>();
  readonly rejected = output<void>();

  private readonly panel = viewChild.required<TemplateRef<unknown>>('panel');
  /** Abierta como overlay anclado a un disparador. */
  protected readonly anchored = signal(false);
  private overlayRef: OverlayRef | null = null;
  private trigger: HTMLElement | null = null;

  private readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
  ];

  /** Abre la confirmación anclada al elemento que recibió el evento. */
  confirm(event: Event): void {
    this.show(event.currentTarget as HTMLElement);
  }

  /** Abre la confirmación anclada a `target`. */
  show(target: HTMLElement): void {
    if (this.overlayRef) return;
    this.trigger = target;
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().flexibleConnectedTo(target).withPositions(this.positions).withPush(true),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });
    this.overlayRef.attach(new TemplatePortal(this.panel(), this.vcr));
    this.overlayRef.backdropClick().subscribe(() => this.reject());
    this.anchored.set(true);
    this.visible.set(true);
    // Foco en la opción segura (cancelar), como en ConfirmDialog.
    afterNextRender(() => this.overlayRef?.overlayElement.querySelector<HTMLElement>('button')?.focus(), {
      injector: this.injector,
    });
  }

  protected accept(): void {
    this.accepted.emit();
    this.close();
  }

  protected reject(): void {
    this.rejected.emit();
    this.close();
  }

  private close(): void {
    this.visible.set(false);
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
      this.anchored.set(false);
      this.trigger?.focus();
      this.trigger = null;
    }
  }
}

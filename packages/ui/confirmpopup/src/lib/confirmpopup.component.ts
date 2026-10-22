import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  Injector,
  untracked,
} from '@angular/core';
import { Overlay, type ConnectedPosition, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CbConfirmationService, injectCbTranslation, type CbConfirmation, type CbConfirmSeverity } from '@caribeng/ui';
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
 *
 * Con `service` muestra las confirmaciones de `CbConfirmationService` que traen
 * `target` (como `ConfirmationService` de PrimeNG):
 *
 * ```html
 * <cb-button (click)="borrar($event)">Eliminar</cb-button>
 * <cb-confirm-popup service />
 * ```
 * ```ts
 * borrar(event: Event) {
 *   inject(CbConfirmationService).confirm({ target: event.currentTarget, message: '¿Eliminar?', accept: () => this.eliminar() });
 * }
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
        <p class="cb-confirm-popup__message" [id]="messageId">{{ shown().message }}</p>
        <div class="cb-confirm-popup__actions">
          <cb-button size="sm" variant="text" severity="secondary" (click)="reject()">
            {{ shown().rejectLabel }}
          </cb-button>
          <cb-button size="sm" [severity]="shown().acceptSeverity" (click)="accept()">
            {{ shown().acceptLabel }}
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
  private readonly confirmation = inject(CbConfirmationService);
  protected readonly messageId = `cb-confirm-popup-${++nextUid}-message`;

  /** Visibilidad (two-way). Con `[(visible)]` se muestra en línea. */
  readonly visible = model(false);
  /** Pregunta a confirmar. Por defecto, la del idioma activo. */
  readonly message = input<string | undefined>(undefined);
  readonly acceptLabel = input<string | undefined>(undefined);
  readonly rejectLabel = input<string | undefined>(undefined);
  /** Severidad del botón de aceptar (p. ej. `danger` para acciones destructivas). */
  readonly acceptSeverity = input<CbConfirmSeverity>('primary');
  /**
   * Muestra las confirmaciones pedidas con `CbConfirmationService`. Sin él, el
   * componente solo responde a `[(visible)]` (así un diálogo declarativo no se
   * abre con las confirmaciones de otra parte de la app).
   */
  readonly service = input<boolean, unknown>(false, { transform: toBoolean });
  /** Con `service`: atiende solo las confirmaciones con este mismo `key` (o sin key si no se indica). */
  readonly key = input<string | undefined>(undefined);

  readonly accepted = output<void>();
  readonly rejected = output<void>();

  private readonly panel = viewChild.required<TemplateRef<unknown>>('panel');
  /** Abierta como overlay anclado a un disparador. */
  protected readonly anchored = signal(false);
  private overlayRef: OverlayRef | null = null;
  private trigger: HTMLElement | null = null;

  /** Confirmación pedida con `CbConfirmationService` que se está mostrando. */
  private readonly active = signal<CbConfirmation | null>(null);

  /** Textos visibles: los de la confirmación del servicio, si la hay; si no, los inputs y el idioma. */
  protected readonly shown = computed(() => {
    const active = this.active();
    const t = this.t();
    return {
      message: active?.message ?? this.message() ?? t.confirmMessage,
      acceptLabel: active?.acceptLabel ?? this.acceptLabel() ?? t.accept,
      rejectLabel: active?.rejectLabel ?? this.rejectLabel() ?? t.cancel,
      acceptSeverity: active?.acceptSeverity ?? this.acceptSeverity(),
    };
  });

  constructor() {
    effect(() => {
      if (!this.service()) return;
      const request = this.confirmation.request();
      untracked(() => {
        const target = request?.confirmation.target;
        if (request && request.confirmation.key === this.key() && target instanceof HTMLElement) {
          // Una nueva petición sustituye a la que estuviera abierta.
          if (this.overlayRef) this.dispose();
          this.active.set(request.confirmation);
          this.show(target);
        } else if (!request && this.active()) {
          // Cerrada desde el servicio (close()).
          this.active.set(null);
          this.close();
        }
      });
    });
  }

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
    this.finish('accept');
  }

  protected reject(): void {
    this.rejected.emit();
    this.finish('reject');
  }

  /** Cierra y, si venía del servicio, lo libera y ejecuta su callback (que puede pedir otra confirmación). */
  private finish(action: 'accept' | 'reject'): void {
    const active = this.active();
    this.active.set(null);
    this.close();
    if (active) {
      this.confirmation.close();
      active[action]?.();
    }
  }

  private close(): void {
    this.visible.set(false);
    if (this.overlayRef) {
      this.dispose();
      this.trigger?.focus();
      this.trigger = null;
    }
  }

  /** Quita el overlay sin devolver el foco. */
  private dispose(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.anchored.set(false);
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}

import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { CbConfirmationService, injectCbTranslation, type CbConfirmation, type CbConfirmSeverity } from '@caribeng/ui';
import { CbButton } from '@caribeng/ui/button';

let nextUid = 0;

/**
 * Diálogo de confirmación (`role="alertdialog"`) con trampa de foco, cierre con
 * Escape (equivale a cancelar) y restauración del foco al cerrarse. Al abrirse,
 * el foco va al botón de cancelar (la opción segura).
 *
 * @example
 * ```html
 * <cb-confirm-dialog
 *   [(visible)]="confirmar"
 *   header="Eliminar cuenta"
 *   message="Esta acción no se puede deshacer."
 *   acceptSeverity="danger"
 *   (accepted)="eliminar()"
 * />
 * ```
 *
 * Con `service` muestra las confirmaciones pedidas desde código con
 * `CbConfirmationService` (como `ConfirmationService` de PrimeNG):
 *
 * ```html
 * <cb-confirm-dialog service />
 * ```
 * ```ts
 * inject(CbConfirmationService).confirm({ message: '¿Eliminar?', accept: () => this.eliminar() });
 * ```
 */
@Component({
  selector: 'cb-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [A11yModule, CbButton],
  host: { '(document:keydown.escape)': 'onEscape()' },
  template: `
    @if (visible()) {
      <div class="cb-confirm-dialog__mask" (click)="reject()">
        <section
          class="cb-confirm-dialog"
          role="alertdialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          [attr.aria-describedby]="messageId"
          cdkTrapFocus
          cdkTrapFocusAutoCapture
          (click)="$event.stopPropagation()"
        >
          <h2 class="cb-confirm-dialog__title" [id]="titleId">{{ shown().header }}</h2>
          <p class="cb-confirm-dialog__message" [id]="messageId">{{ shown().message }}</p>
          <footer class="cb-confirm-dialog__actions">
            <cb-button variant="text" severity="secondary" (click)="reject()">{{ shown().rejectLabel }}</cb-button>
            <cb-button [severity]="shown().acceptSeverity" (click)="confirm()">{{ shown().acceptLabel }}</cb-button>
          </footer>
        </section>
      </div>
    }
  `,
  styleUrl: './confirmdialog.component.css',
})
export class CbConfirmDialog {
  protected readonly t = injectCbTranslation();
  private readonly document = inject(DOCUMENT);
  private readonly confirmation = inject(CbConfirmationService);

  /** Visibilidad (two-way). */
  readonly visible = model(false);
  /** Título. Por defecto, "Confirmar" del idioma activo. */
  readonly header = input<string | undefined>(undefined);
  /** Mensaje. Por defecto, "¿Deseas continuar?" del idioma activo. */
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

  protected readonly titleId = `cb-confirm-dialog-${++nextUid}-title`;
  protected readonly messageId = `${this.titleId.replace('-title', '')}-message`;

  /** Confirmación pedida con `CbConfirmationService` que se está mostrando. */
  private readonly active = signal<CbConfirmation | null>(null);

  /** Textos visibles: los de la confirmación del servicio, si la hay; si no, los inputs y el idioma. */
  protected readonly shown = computed(() => {
    const active = this.active();
    const t = this.t();
    return {
      header: active?.header ?? this.header() ?? t.confirm,
      message: active?.message ?? this.message() ?? t.confirmMessage,
      acceptLabel: active?.acceptLabel ?? this.acceptLabel() ?? t.accept,
      rejectLabel: active?.rejectLabel ?? this.rejectLabel() ?? t.cancel,
      acceptSeverity: active?.acceptSeverity ?? this.acceptSeverity(),
    };
  });

  /** Elemento enfocado antes de abrir; recibe el foco de vuelta al cerrar. */
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.previouslyFocused ??= this.document.activeElement as HTMLElement | null;
      } else if (this.previouslyFocused) {
        const el = this.previouslyFocused;
        this.previouslyFocused = null;
        queueMicrotask(() => el.focus?.());
      }
    });

    effect(() => {
      if (!this.service()) return;
      const request = this.confirmation.request();
      untracked(() => {
        if (request && request.confirmation.key === this.key()) {
          this.active.set(request.confirmation);
          this.visible.set(true);
        } else if (!request && this.active()) {
          // Cerrada desde el servicio (close()).
          this.active.set(null);
          this.visible.set(false);
        }
      });
    });
  }

  protected onEscape(): void {
    if (this.visible()) this.reject();
  }

  protected confirm(): void {
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
    this.visible.set(false);
    if (active) {
      this.confirmation.close();
      active[action]?.();
    }
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}

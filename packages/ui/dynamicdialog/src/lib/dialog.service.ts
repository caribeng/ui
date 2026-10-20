import { DOCUMENT, NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  InjectionToken,
  Injector,
  ViewEncapsulation,
  inject,
  type Type,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Subject, type Observable } from 'rxjs';
import { injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

/** Opciones de `CbDialogService.open()`. */
export interface CbDynamicDialogConfig<D = unknown> {
  /** Título del diálogo; si se omite, se usa `ariaLabel` como nombre accesible. */
  header?: string;
  /** Datos para el componente abierto (inyéctalos con `CB_DYNAMIC_DIALOG_DATA`). */
  data?: D;
  /** Ancho del panel. Por defecto `32rem`. */
  width?: string;
  /** Muestra el botón de cerrar. Por defecto `true`. */
  closable?: boolean;
  /** Cierra con Escape. Por defecto `true`. */
  closeOnEscape?: boolean;
  /** Cierra al hacer clic en el fondo. Por defecto `true`. */
  dismissableMask?: boolean;
  /** Nombre accesible cuando no hay `header`. */
  ariaLabel?: string;
}

/** Datos pasados en `config.data`, para inyectar en el componente abierto. */
export const CB_DYNAMIC_DIALOG_DATA = new InjectionToken<unknown>('CB_DYNAMIC_DIALOG_DATA');

/**
 * Referencia a un diálogo abierto con `CbDialogService`. El componente abierto
 * puede inyectarla para cerrarse devolviendo un resultado.
 */
export class CbDynamicDialogRef<R = unknown> {
  private readonly closed$ = new Subject<R | undefined>();
  private isClosed = false;

  /** Emite el resultado (o `undefined` si se cerró sin él) y completa. */
  readonly onClose: Observable<R | undefined> = this.closed$.asObservable();

  /** @internal */
  constructor(private readonly dispose: () => void) {}

  /** Cierra el diálogo devolviendo un resultado opcional. */
  close(result?: R): void {
    if (this.isClosed) return;
    this.isClosed = true;
    this.dispose();
    this.closed$.next(result);
    this.closed$.complete();
  }
}

let nextUid = 0;

/** @internal */
const CbDynamicDialogConfigToken = new InjectionToken<CbDynamicDialogConfig>('CbDynamicDialogConfig');
/** @internal */
const CbDynamicDialogComponentToken = new InjectionToken<Type<unknown>>('CbDynamicDialogComponent');

/** Contenedor visual del diálogo dinámico (uso interno de CbDialogService). */
@Component({
  selector: 'cb-dynamic-dialog-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [A11yModule, NgComponentOutlet, CbIcon],
  template: `
    <div
      class="cb-dynamic-dialog"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="config.header ? titleId : null"
      [attr.aria-label]="config.header ? null : config.ariaLabel || t().dialog"
      [style.width]="config.width || '32rem'"
      cdkTrapFocus
      cdkTrapFocusAutoCapture
    >
      @if (config.header || config.closable !== false) {
        <header class="cb-dynamic-dialog__header">
          @if (config.header) {
            <h2 class="cb-dynamic-dialog__title" [id]="titleId">{{ config.header }}</h2>
          }
          @if (config.closable !== false) {
            <button type="button" class="cb-dynamic-dialog__close" [attr.aria-label]="t().close" (click)="ref.close()">
              <cb-icon name="x" [size]="16" aria-hidden="true" />
            </button>
          }
        </header>
      }
      <div class="cb-dynamic-dialog__body">
        <ng-container *ngComponentOutlet="component; injector: injector" />
      </div>
    </div>
  `,
  styleUrl: './dynamicdialog.component.css',
})
export class CbDynamicDialogContainer {
  protected readonly t = injectCbTranslation();
  protected readonly config = inject(CbDynamicDialogConfigToken);
  protected readonly ref = inject(CbDynamicDialogRef);
  protected readonly component = inject(CbDynamicDialogComponentToken);
  protected readonly injector = inject(Injector);
  protected readonly titleId = `cb-dynamic-dialog-${++nextUid}-title`;
}

/**
 * Abre componentes dentro de un diálogo modal (como `DialogService` de PrimeNG):
 * trampa de foco, cierre con Escape y fondo, y devolución del foco al cerrar.
 *
 * @example
 * ```ts
 * const ref = inject(CbDialogService).open(EditarCliente, {
 *   header: 'Editar cliente',
 *   data: { id: 42 },
 * });
 * ref.onClose.subscribe((guardado) => { … });
 *
 * // Dentro de EditarCliente:
 * readonly data = inject<{ id: number }>(CB_DYNAMIC_DIALOG_DATA);
 * readonly ref = inject(CbDynamicDialogRef);
 * guardar() { this.ref.close(true); }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class CbDialogService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  open<T, D = unknown, R = unknown>(component: Type<T>, config: CbDynamicDialogConfig<D> = {}): CbDynamicDialogRef<R> {
    const previouslyFocused = this.document.activeElement as HTMLElement | null;
    const overlayRef: OverlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cb-dialog-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
    });

    const ref = new CbDynamicDialogRef<R>(() => {
      overlayRef.dispose();
      previouslyFocused?.focus?.();
    });

    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: CbDynamicDialogRef, useValue: ref },
        { provide: CB_DYNAMIC_DIALOG_DATA, useValue: config.data },
        { provide: CbDynamicDialogConfigToken, useValue: config },
        { provide: CbDynamicDialogComponentToken, useValue: component },
      ],
    });
    overlayRef.attach(new ComponentPortal(CbDynamicDialogContainer, null, injector));

    overlayRef.backdropClick().subscribe(() => {
      if (config.dismissableMask !== false) ref.close();
    });
    overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape' && config.closeOnEscape !== false) {
        event.preventDefault();
        ref.close();
      }
    });
    return ref;
  }
}

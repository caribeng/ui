import { Injectable, signal } from '@angular/core';

/** Severidad del botón de aceptar de una confirmación. */
export type CbConfirmSeverity = 'primary' | 'danger' | 'success' | 'warning';

/** Opciones de una confirmación pedida con {@link CbConfirmationService.confirm}. */
export interface CbConfirmation {
  /** Pregunta a confirmar. Por defecto, la del idioma activo. */
  message?: string;
  /** Título (solo `cb-confirm-dialog`). Por defecto, "Confirmar" del idioma activo. */
  header?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  /** Severidad del botón de aceptar (p. ej. `danger` para acciones destructivas). */
  acceptSeverity?: CbConfirmSeverity;
  /** Se ejecuta al aceptar. */
  accept?: () => void;
  /** Se ejecuta al cancelar (botón, Escape o clic fuera). */
  reject?: () => void;
  /**
   * Elemento al que se ancla `cb-confirm-popup` (normalmente
   * `event.currentTarget`). Sin `target` la atiende solo `cb-confirm-dialog`.
   */
  target?: EventTarget | null;
  /**
   * Para tener varias en la misma vista: la atiende el `cb-confirm-dialog` o
   * `cb-confirm-popup` con el mismo `key`. Sin `key`, los que no tienen.
   */
  key?: string;
}

/** Confirmación en curso. */
export interface CbConfirmationRequest {
  readonly id: number;
  readonly confirmation: CbConfirmation;
}

let nextId = 0;

/**
 * Pide confirmaciones desde código, sin declarar un diálogo por cada una. Las
 * muestra el `<cb-confirm-dialog service />` o `<cb-confirm-popup service />` de la vista
 * (el input `service` los conecta), igual que `ConfirmationService` de PrimeNG.
 *
 * @example
 * ```ts
 * private readonly confirmation = inject(CbConfirmationService);
 *
 * borrar(item: Item, event: Event): void {
 *   this.confirmation.confirm({
 *     message: `¿Eliminar ${item.nombre}?`,
 *     acceptSeverity: 'danger',
 *     target: event.currentTarget, // solo para cb-confirm-popup
 *     accept: () => this.api.eliminar(item.id),
 *   });
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class CbConfirmationService {
  private readonly _request = signal<CbConfirmationRequest | null>(null);
  /** Confirmación en curso, o `null`. La leen `cb-confirm-dialog` y `cb-confirm-popup`. */
  readonly request = this._request.asReadonly();

  /** Muestra una confirmación. Si había otra abierta, la sustituye (sin llamar a su `reject`). */
  confirm(confirmation: CbConfirmation): void {
    this._request.set({ id: ++nextId, confirmation });
  }

  /** Cierra la confirmación en curso sin llamar a `accept` ni a `reject`. */
  close(): void {
    this._request.set(null);
  }
}

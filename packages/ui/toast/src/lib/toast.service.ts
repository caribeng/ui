import { Injectable, signal } from '@angular/core';
import type { CbSeverity } from '@caribeng/ui';

export interface CbToast {
  readonly id: number;
  readonly severity: CbSeverity;
  readonly summary: string;
  readonly detail?: string;
  readonly life: number;
  readonly closable: boolean;
}

export interface CbToastOptions {
  severity?: CbSeverity;
  summary: string;
  detail?: string;
  /** Milisegundos antes del auto-cierre. 0 = permanente. Por defecto 3000. */
  life?: number;
  closable?: boolean;
}

let nextId = 0;

/**
 * Servicio de notificaciones (toasts) de CaribeNG, basado en signals.
 * Coloca un `<cb-toast />` una vez en la app y lanza mensajes desde aquí.
 *
 * @example
 * ```ts
 * const toast = inject(CbToastService);
 * toast.success('Guardado', 'Los cambios se guardaron.');
 * toast.error('Error', 'No se pudo completar.');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class CbToastService {
  private readonly _toasts = signal<CbToast[]>([]);
  /** Lista reactiva de toasts activos. */
  readonly toasts = this._toasts.asReadonly();

  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  /** Agrega un toast y devuelve su id. */
  add(options: CbToastOptions): number {
    const toast: CbToast = {
      id: ++nextId,
      severity: options.severity ?? 'info',
      summary: options.summary,
      detail: options.detail,
      life: options.life ?? 3000,
      closable: options.closable ?? true,
    };
    this._toasts.update((list) => [...list, toast]);
    if (toast.life > 0) {
      this.timers.set(
        toast.id,
        setTimeout(() => this.remove(toast.id), toast.life),
      );
    }
    return toast.id;
  }

  /** Cierra un toast por id. */
  remove(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  /** Cierra todos los toasts. */
  clear(): void {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
    this._toasts.set([]);
  }

  success(summary: string, detail?: string, options?: Partial<CbToastOptions>): number {
    return this.add({ ...options, severity: 'success', summary, detail });
  }
  info(summary: string, detail?: string, options?: Partial<CbToastOptions>): number {
    return this.add({ ...options, severity: 'info', summary, detail });
  }
  warn(summary: string, detail?: string, options?: Partial<CbToastOptions>): number {
    return this.add({ ...options, severity: 'warning', summary, detail });
  }
  error(summary: string, detail?: string, options?: Partial<CbToastOptions>): number {
    return this.add({ ...options, severity: 'danger', summary, detail });
  }
}

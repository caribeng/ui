import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal, type Signal } from '@angular/core';

/** Breakpoints de CaribeNG, de menor a mayor (`xs` es todo lo que queda por debajo de `sm`). */
export type CbBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** Ancho mínimo de cada breakpoint en px (coinciden con `--cb-breakpoint-*` y las utilidades `md:cb-*`). */
export const CB_BREAKPOINTS: Readonly<Record<CbBreakpoint, number>> = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  '2xl': 1400,
};

const ORDER: readonly CbBreakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

/**
 * El breakpoint actual como signals, para lo que las utilidades CSS no pueden hacer: no renderizar
 * una parte, cambiar un input o elegir otra vista según el ancho de la ventana (mobile-first).
 *
 * En el servidor (o sin `matchMedia`) todas las consultas son `false` y `current()` es `xs`.
 *
 * @example
 * ```ts
 * protected readonly bp = inject(CbBreakpoints);
 * protected readonly desktop = this.bp.up('lg');
 * ```
 * ```html
 * @if (desktop()) { <aside>…</aside> }
 * <cb-table [size]="bp.down('md')() ? 'sm' : 'md'" />
 * ```
 */
@Injectable({ providedIn: 'root' })
export class CbBreakpoints {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID)) && typeof matchMedia === 'function';
  /** Un signal por media query: el servicio vive lo que la app, así que los listeners no se quitan. */
  private readonly queries = new Map<string, Signal<boolean>>();

  /** El breakpoint mayor cuyo ancho mínimo se cumple. */
  readonly current = computed<CbBreakpoint>(() => {
    for (let i = ORDER.length - 1; i > 0; i--) {
      if (this.up(ORDER[i])()) return ORDER[i];
    }
    return 'xs';
  });

  /** `true` desde el ancho de `bp` en adelante (`md:` en las utilidades). */
  up(bp: CbBreakpoint): Signal<boolean> {
    return bp === 'xs' ? ALWAYS : this.matches(`(min-width: ${CB_BREAKPOINTS[bp]}px)`);
  }

  /** `true` por debajo del ancho de `bp` (`down('md')` es el móvil y la tableta en vertical). */
  down(bp: CbBreakpoint): Signal<boolean> {
    return bp === 'xs' ? NEVER : this.matches(`(max-width: ${CB_BREAKPOINTS[bp] - 0.02}px)`);
  }

  /** `true` desde `from` hasta antes de `to`. */
  between(from: CbBreakpoint, to: CbBreakpoint): Signal<boolean> {
    const up = this.up(from);
    const down = this.down(to);
    return computed(() => up() && down());
  }

  /** Cualquier media query (`(orientation: portrait)`, `(prefers-reduced-motion: reduce)`…) como signal. */
  matches(query: string): Signal<boolean> {
    let state = this.queries.get(query);
    if (!state) {
      // El valor inicial va en signal(): matches() se puede llamar dentro de un computed, donde no se escribe.
      const mql = this.isBrowser ? matchMedia(query) : null;
      const value = signal(mql?.matches ?? false);
      mql?.addEventListener('change', (e) => value.set(e.matches));
      state = value.asReadonly();
      this.queries.set(query, state);
    }
    return state;
  }
}

const ALWAYS: Signal<boolean> = signal(true).asReadonly();
const NEVER: Signal<boolean> = signal(false).asReadonly();

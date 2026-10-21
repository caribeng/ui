import { DOCUMENT } from '@angular/common';
import { Injector, afterNextRender, effect, inject, untracked } from '@angular/core';

/** Opciones de {@link cbOverlayFocus}. */
export interface CbOverlayFocusOptions {
  /** Si el overlay está abierto (se lee como señal). */
  open: () => boolean;
  /** Elemento que recibe el foco al abrir (p. ej. el botón de cerrar). */
  initialFocus: () => HTMLElement | null | undefined;
}

/**
 * Gestión de foco de overlays (diálogos, paneles, popovers), según WAI-ARIA:
 * al abrirse, recuerda el elemento enfocado y mueve el foco a `initialFocus`;
 * al cerrarse, devuelve el foco al elemento que lo tenía.
 *
 * Debe llamarse en un contexto de inyección (constructor o inicializador de campo).
 *
 * @example
 * ```ts
 * readonly visible = model(false);
 * private readonly closeBtn = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');
 * constructor() {
 *   cbOverlayFocus({ open: this.visible, initialFocus: () => this.closeBtn()?.nativeElement });
 * }
 * ```
 */
export function cbOverlayFocus(options: CbOverlayFocusOptions): void {
  const injector = inject(Injector);
  const document = inject(DOCUMENT);
  let previous: HTMLElement | null = null;
  let wasOpen = false;

  effect(() => {
    const open = options.open();
    if (open === wasOpen) return;
    wasOpen = open;
    untracked(() => {
      if (open) {
        previous = document.activeElement as HTMLElement | null;
        afterNextRender(() => options.initialFocus()?.focus(), { injector });
      } else {
        const target = previous;
        previous = null;
        if (target?.isConnected) afterNextRender(() => target.focus(), { injector });
      }
    });
  });
}

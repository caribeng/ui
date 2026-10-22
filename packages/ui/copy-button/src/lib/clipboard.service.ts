import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

/**
 * Portapapeles de CaribeNG. Usa la API asíncrona del navegador y, si no está
 * disponible (HTTP sin contexto seguro, navegadores antiguos), un textarea
 * temporal con `execCommand('copy')`.
 */
@Injectable({ providedIn: 'root' })
export class CbClipboard {
  private readonly doc = inject(DOCUMENT);

  /** Copia `text`. Resuelve `true` si se copió y `false` si el navegador lo impidió. */
  async copy(text: string): Promise<boolean> {
    const clipboard = this.doc.defaultView?.navigator?.clipboard;
    if (clipboard?.writeText) {
      try {
        await clipboard.writeText(text);
        return true;
      } catch {
        // Sin permiso o sin foco: se intenta el método clásico.
      }
    }
    return this.copyWithTextarea(text);
  }

  private copyWithTextarea(text: string): boolean {
    const doc = this.doc;
    if (!doc.body || typeof doc.execCommand !== 'function') return false;
    const active = doc.activeElement as HTMLElement | null;
    const area = doc.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    area.style.pointerEvents = 'none';
    doc.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = doc.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    active?.focus?.();
    return ok;
  }
}

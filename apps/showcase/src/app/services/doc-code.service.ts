import { Injectable, signal } from '@angular/core';

/** Hash estable del HTML (debe coincidir con `docCodeKey` en scripts/gen-doc-code.mjs). */
export function docCodeKey(html: string): string {
  const s = html.trim();
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(36) + (h1 >>> 0).toString(36);
}

/**
 * Componente TypeScript completo de cada ejemplo, generado por
 * `apps/showcase/scripts/gen-doc-code.mjs` en `public/doc-code.json`.
 * Se descarga una sola vez y de forma perezosa (no pesa en el bundle).
 */
@Injectable({ providedIn: 'root' })
export class DocCodeService {
  private readonly map = signal<Record<string, string>>({});
  private loading: Promise<void> | null = null;

  /** Dispara la descarga del JSON (idempotente). */
  load(): void {
    this.loading ??= fetch(new URL('doc-code.json', document.baseURI))
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: Record<string, string>) => this.map.set(data))
      .catch(() => {
        /* sin código generado: se muestra solo el HTML */
      });
  }

  /** TS generado para un snippet HTML (reactivo: '' hasta que carga). */
  forHtml(html: string): string {
    return html ? (this.map()[docCodeKey(html)] ?? '') : '';
  }
}

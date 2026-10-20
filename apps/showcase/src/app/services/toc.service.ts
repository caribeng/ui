import { Injectable, signal } from '@angular/core';

export interface TocEntry {
  id: string;
  /** Texto en español; el TOC lo traduce con `I18nService.auto()`. */
  label: string;
}

function sortByDom(list: TocEntry[]): TocEntry[] {
  if (typeof document === 'undefined') return list;
  const pos = (id: string) => document.getElementById(id);
  return list.sort((a, b) => {
    const ea = pos(a.id);
    const eb = pos(b.id);
    if (!ea || !eb) return 0;
    return ea.compareDocumentPosition(eb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });
}

/** Registro de secciones de la página actual para el TOC derecho. */
@Injectable({ providedIn: 'root' })
export class TocService {
  readonly entries = signal<TocEntry[]>([]);
  readonly active = signal<string | null>(null);

  reset(): void {
    this.entries.set([]);
    this.active.set(null);
  }

  /** Registra una sección; la lista queda en el orden en que aparecen en la página. */
  register(entry: TocEntry): void {
    this.entries.update((list) =>
      list.some((e) => e.id === entry.id) ? list : sortByDom([...list, entry]),
    );
  }

  setActive(id: string | null): void {
    this.active.set(id);
  }
}

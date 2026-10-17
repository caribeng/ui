import { Injectable, signal } from '@angular/core';

export interface TocEntry {
  id: string;
  label: string;
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

  register(entry: TocEntry): void {
    this.entries.update((list) =>
      list.some((e) => e.id === entry.id) ? list : [...list, entry],
    );
  }

  setActive(id: string | null): void {
    this.active.set(id);
  }
}

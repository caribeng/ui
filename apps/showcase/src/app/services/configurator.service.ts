import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';
import {
  PRIMARY_PALETTES,
  SHADES,
  SURFACE_PALETTES,
  SURFACE_SHADES,
} from '../data/palettes';

const STORAGE_KEY = 'caribeng-docs-config';

/**
 * Configurador de tema en vivo (estilo PrimeNG): cambia la paleta primary y
 * surface sobrescribiendo las variables CSS `--cb-*` en el elemento raíz.
 */
@Injectable({ providedIn: 'root' })
export class ConfiguratorService {
  private readonly document = inject(DOCUMENT);

  readonly primary = signal<string>('emerald');
  readonly surface = signal<string>('slate');

  constructor() {
    this.restore();
    effect(() => this.applyPrimary(this.primary()));
    effect(() => this.applySurface(this.surface()));
    effect(() => this.persist());
  }

  setPrimary(name: string): void {
    if (PRIMARY_PALETTES[name]) this.primary.set(name);
  }

  setSurface(name: string): void {
    if (SURFACE_PALETTES[name]) this.surface.set(name);
  }

  private applyPrimary(name: string): void {
    const scale = PRIMARY_PALETTES[name];
    if (!scale) return;
    const root = this.document.documentElement;
    SHADES.forEach((shade, i) => {
      root.style.setProperty(`--cb-color-primary-${shade}`, scale[i]);
    });
  }

  private applySurface(name: string): void {
    const scale = SURFACE_PALETTES[name];
    if (!scale) return;
    const root = this.document.documentElement;
    SURFACE_SHADES.forEach((shade, i) => {
      root.style.setProperty(`--cb-color-surface-${shade}`, scale[i]);
    });
  }

  private persist(): void {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ primary: this.primary(), surface: this.surface() }),
      );
    } catch {
      /* almacenamiento no disponible */
    }
  }

  private restore(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { primary?: string; surface?: string };
      if (parsed.primary && PRIMARY_PALETTES[parsed.primary]) {
        this.primary.set(parsed.primary);
      }
      if (parsed.surface && SURFACE_PALETTES[parsed.surface]) {
        this.surface.set(parsed.surface);
      }
    } catch {
      /* ignora config corrupta */
    }
  }
}

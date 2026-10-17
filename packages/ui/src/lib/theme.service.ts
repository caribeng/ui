import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CB_CONFIG, type CbTheme, type CbThemePreference } from './caribeng.config';

/**
 * Gestiona el tema (claro/oscuro) de CaribeNG mediante signals.
 *
 * - Refleja el tema activo en el elemento raíz (`data-theme`).
 * - Soporta la preferencia `system` siguiendo `prefers-color-scheme`.
 * - No inyecta `NgZone` ni fuerza una estrategia de detección de cambios.
 */
@Injectable({ providedIn: 'root' })
export class CbThemeService {
  private readonly config = inject(CB_CONFIG);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Preferencia elegida por el usuario: 'light' | 'dark' | 'system'. */
  private readonly preference = signal<CbThemePreference>(this.config.theme);

  /** Resultado de `prefers-color-scheme` (solo relevante con 'system'). */
  private readonly systemDark = signal<boolean>(this.readSystemDark());

  /** Tema efectivo aplicado al DOM. */
  readonly theme = computed<CbTheme>(() => {
    const pref = this.preference();
    if (pref === 'system') {
      return this.systemDark() ? 'dark' : 'light';
    }
    return pref;
  });

  /** `true` cuando el tema efectivo es oscuro. */
  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    this.restorePersisted();
    this.listenSystemPreference();

    // Refleja el tema efectivo en el elemento raíz de forma reactiva.
    effect(() => {
      const theme = this.theme();
      const root = this.document.documentElement;
      root?.setAttribute(this.config.themeAttribute, theme);
    });

    // Persiste la preferencia del usuario si está habilitado.
    effect(() => {
      const pref = this.preference();
      if (this.isBrowser && this.config.persistTheme) {
        try {
          localStorage.setItem(this.config.storageKey, pref);
        } catch {
          /* almacenamiento no disponible */
        }
      }
    });
  }

  /** Fija el tema de forma explícita. */
  setTheme(theme: CbThemePreference): void {
    this.preference.set(theme);
  }

  /** Alterna entre claro y oscuro a partir del tema efectivo actual. */
  toggle(): void {
    this.preference.set(this.isDark() ? 'light' : 'dark');
  }

  private readSystemDark(): boolean {
    if (!this.isBrowser || typeof matchMedia !== 'function') {
      return false;
    }
    return matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private restorePersisted(): void {
    if (!this.isBrowser || !this.config.persistTheme) {
      return;
    }
    try {
      const saved = localStorage.getItem(this.config.storageKey);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        this.preference.set(saved);
      }
    } catch {
      /* almacenamiento no disponible */
    }
  }

  private listenSystemPreference(): void {
    if (!this.isBrowser || typeof matchMedia !== 'function') {
      return;
    }
    const mql = matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', (e) => this.systemDark.set(e.matches));
  }
}

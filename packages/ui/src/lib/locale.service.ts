import { Injectable, computed, inject, signal, type Signal } from '@angular/core';
import { CB_CONFIG } from './caribeng.config';
import { CB_LOCALES, type CbLocaleCode, type CbTranslation } from './locale';

/**
 * Idioma de los textos de interfaz de CaribeNG. Se configura con
 * `provideCaribeNG({ locale, translation })` y puede cambiarse en caliente:
 * todos los componentes leen las traducciones como signal.
 *
 * ```ts
 * const locale = inject(CbLocaleService);
 * locale.use('en');                          // idioma incluido
 * locale.setTranslation({ close: 'Salir' }); // sobrescribe textos sueltos
 * ```
 */
@Injectable({ providedIn: 'root' })
export class CbLocaleService {
  private readonly config = inject(CB_CONFIG);

  private readonly base = signal<CbTranslation>(resolve(this.config.locale));
  private readonly overrides = signal<Partial<CbTranslation>>(this.config.translation ?? {});

  /** Traducciones activas (idioma base + textos sobrescritos). */
  readonly translation: Signal<CbTranslation> = computed(() => ({ ...this.base(), ...this.overrides() }));

  /** Cambia el idioma base (`'es'`, `'en'` o un objeto de traducciones completo). */
  use(locale: CbLocaleCode | CbTranslation): void {
    this.base.set(resolve(locale));
  }

  /** Sobrescribe textos sueltos sobre el idioma activo (se acumulan). */
  setTranslation(translation: Partial<CbTranslation>): void {
    this.overrides.update((current) => ({ ...current, ...translation }));
  }
}

/** Traducciones activas de CaribeNG como signal (para usar en componentes). */
export function injectCbTranslation(): Signal<CbTranslation> {
  return inject(CbLocaleService).translation;
}

function resolve(locale: CbLocaleCode | CbTranslation | undefined): CbTranslation {
  if (!locale) return CB_LOCALES.es;
  return typeof locale === 'string' ? (CB_LOCALES[locale] ?? CB_LOCALES.es) : locale;
}

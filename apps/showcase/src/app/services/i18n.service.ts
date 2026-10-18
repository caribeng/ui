import { Injectable, computed, signal } from '@angular/core';

export type CbLang = 'es' | 'en';

const STORAGE_KEY = 'caribeng-showcase-lang';

/**
 * Servicio de internacionalización del showcase (ES/EN) basado en signals.
 *
 * Patrón de uso en plantillas: `{{ i18n.t('Texto en español', 'English text') }}`.
 * Al leer el signal `lang()` dentro de `t()`, las expresiones de plantilla se
 * recalculan automáticamente al cambiar de idioma (incluso con OnPush).
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<CbLang>(this.read());
  readonly isEnglish = computed(() => this.lang() === 'en');

  constructor() {
    this.persist(this.lang());
  }

  /** Devuelve la cadena según el idioma activo. */
  t(es: string, en: string): string {
    return this.lang() === 'en' ? en : es;
  }

  setLang(lang: CbLang): void {
    this.lang.set(lang);
    this.persist(lang);
  }

  toggle(): void {
    this.setLang(this.lang() === 'es' ? 'en' : 'es');
  }

  private read(): CbLang {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'es';
    } catch {
      return 'es';
    }
  }

  private persist(lang: CbLang): void {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* no-op: almacenamiento no disponible */
    }
    try {
      document.documentElement.lang = lang;
    } catch {
      /* no-op: sin DOM */
    }
  }
}

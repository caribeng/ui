import { Injectable, computed, inject, signal } from '@angular/core';
import { CbLocaleService } from '@caribeng/ui';
import { ES_EN } from './i18n-dict';

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

  /** Idioma de los componentes de la librería: sigue al del sitio. */
  private readonly locale = inject(CbLocaleService);

  constructor() {
    this.persist(this.lang());
  }

  /** Devuelve la cadena según el idioma activo. */
  t(es: string, en: string): string {
    return this.lang() === 'en' ? en : es;
  }

  /**
   * Traduce una cadena en español usando el diccionario central ES→EN.
   * Si el idioma es ES, o la cadena no está en el diccionario, la devuelve tal
   * cual (seguro para nombres propios, código y contenido aún sin traducir).
   */
  auto(value: string | null | undefined): string {
    if (!value) return value ?? '';
    return this.lang() === 'en' ? (ES_EN[value] ?? value) : value;
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
    this.locale.use(lang);
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

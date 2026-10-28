import { InjectionToken } from '@angular/core';
import type { CbLocaleCode, CbTranslation } from './locale';

/** Tema inicial de la aplicación. `system` sigue a `prefers-color-scheme`. */
export type CbTheme = 'light' | 'dark';
export type CbThemePreference = CbTheme | 'system';

/** Presets de paleta primaria predefinidos en CaribeNG. */
export type CbColorPreset = 'emerald' | 'ocean' | 'coral' | 'amber' | 'violet' | 'rose';

/** Escala completa 50–950 para un preset de color primario. */
export type CbPrimaryScale = Record<
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950,
  string
>;

export const CB_COLOR_PRESETS: Record<CbColorPreset, CbPrimaryScale> = {
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },
  ocean: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0284c7',
    600: '#0369a1',
    700: '#075985',
    800: '#0c4a6e',
    900: '#082f49',
    950: '#041e30',
  },
  coral: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
    950: '#4c0519',
  },
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  violet: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  rose: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724',
  },
};

/** Configuración pública de CaribeNG, provista por `provideCaribeNG()`. */
export interface CaribeNgConfig {
  /** Tema inicial. Por defecto `'light'`. */
  theme: CbThemePreference;
  /** Preset de paleta primaria inicial. Por defecto `'emerald'`. */
  preset?: CbColorPreset;
  /**
   * Atributo del elemento raíz donde se refleja el tema.
   * Por defecto `'data-theme'` sobre `<html>`.
   */
  themeAttribute: string;
  /**
   * Si `true`, persiste la preferencia del usuario en `localStorage`.
   * Por defecto `false`.
   */
  persistTheme: boolean;
  /** Clave de `localStorage` cuando `persistTheme` está activo. */
  storageKey: string;
  /**
   * Cómo se señala en la etiqueta si un campo es obligatorio. Por defecto
   * `'none'` (solo `aria-required`). Cada campo puede sobrescribirlo con su
   * input `requiredIndicator`.
   */
  requiredIndicator: CbRequiredIndicator;
  /** Texto del modo `'text'`. Si se omite, usa `required` del idioma ("requerido" / "required"). */
  requiredText?: string;
  /** Texto del modo `'optional'`. Si se omite, usa `optional` del idioma ("opcional" / "optional"). */
  optionalText?: string;
  /**
   * Idioma de los textos de interfaz (etiquetas accesibles, botones, mensajes
   * por defecto): `'en'` (por defecto), `'es'` o un objeto `CbTranslation` propio.
   */
  locale?: CbLocaleCode | CbTranslation;
  /** Textos sueltos que sobrescriben los del idioma, p. ej. `{ close: 'Salir' }`. */
  translation?: Partial<CbTranslation>;
  /**
   * Moneda por defecto de los importes (código ISO 4217: `COP`, `USD`…) en tablas,
   * Data Grid e `injectCbAmount()`. Sin ella, los importes se escriben sin símbolo.
   */
  currency?: string;
  /** Negativos con signo (`-1.234`, por defecto) o entre paréntesis (`(1.234)`, estilo contable). */
  negativeStyle?: 'minus' | 'parens';
  /**
   * Idioma y país (BCP 47) con el que se escriben los importes: `es-CO` da
   * `$ 1.234,50`. Si se omite, el del idioma de la interfaz (`es`, `en`).
   */
  numberLocale?: string;
}

/**
 * Indicador visual de obligatoriedad en la etiqueta de los campos:
 * - `'asterisk'`: `*` junto a los obligatorios.
 * - `'text'`: "(requerido)" junto a los obligatorios.
 * - `'optional'`: "(opcional)" junto a los que no lo son.
 * - `'none'`: nada visible (el estado se expone igualmente con `aria-required`).
 */
export type CbRequiredIndicator = 'asterisk' | 'text' | 'optional' | 'none';

/** Valores por defecto de la configuración. */
export const CB_DEFAULT_CONFIG: CaribeNgConfig = {
  theme: 'light',
  preset: 'emerald',
  themeAttribute: 'data-theme',
  persistTheme: false,
  storageKey: 'caribeng-theme',
  requiredIndicator: 'none',
  locale: 'en',
};

/** Token de inyección con la configuración resuelta de CaribeNG. */
export const CB_CONFIG = new InjectionToken<CaribeNgConfig>('CB_CONFIG', {
  providedIn: 'root',
  factory: () => CB_DEFAULT_CONFIG,
});

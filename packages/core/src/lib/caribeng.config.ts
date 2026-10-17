import { InjectionToken } from '@angular/core';

/** Tema inicial de la aplicación. `system` sigue a `prefers-color-scheme`. */
export type CbTheme = 'light' | 'dark';
export type CbThemePreference = CbTheme | 'system';

/** Configuración pública de CaribeNG, provista por `provideCaribeNG()`. */
export interface CaribeNgConfig {
  /** Tema inicial. Por defecto `'light'`. */
  theme: CbThemePreference;
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
}

/** Valores por defecto de la configuración. */
export const CB_DEFAULT_CONFIG: CaribeNgConfig = {
  theme: 'light',
  themeAttribute: 'data-theme',
  persistTheme: false,
  storageKey: 'caribeng-theme',
};

/** Token de inyección con la configuración resuelta de CaribeNG. */
export const CB_CONFIG = new InjectionToken<CaribeNgConfig>('CB_CONFIG', {
  providedIn: 'root',
  factory: () => CB_DEFAULT_CONFIG,
});

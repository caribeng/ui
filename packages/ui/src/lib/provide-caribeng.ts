import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  inject,
} from '@angular/core';
import {
  CB_CONFIG,
  CB_DEFAULT_CONFIG,
  type CaribeNgConfig,
} from './caribeng.config';
import { CbThemeService } from './theme.service';

/**
 * Registra CaribeNG en una aplicación Angular (standalone o basada en módulos).
 *
 * No modifica la estrategia de detección de cambios de la app: es compatible
 * tanto con Zone.js como con zoneless.
 *
 * @example
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideCaribeNG({ theme: 'light' })],
 * });
 * ```
 */
export function provideCaribeNG(
  config: Partial<CaribeNgConfig> = {},
): EnvironmentProviders {
  const resolved: CaribeNgConfig = { ...CB_DEFAULT_CONFIG, ...config };

  return makeEnvironmentProviders([
    { provide: CB_CONFIG, useValue: resolved },
    // Instancia el servicio de tema al arrancar para que aplique el atributo
    // del tema en el elemento raíz desde el primer render.
    provideEnvironmentInitializer(() => {
      inject(CbThemeService);
    }),
  ]);
}

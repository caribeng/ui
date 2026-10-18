import {
  InjectionToken,
  Injectable,
  inject,
  makeEnvironmentProviders,
  type EnvironmentProviders,
} from '@angular/core';
import { cbCoreIcons, type CbIconSet } from './icons';

/**
 * Token multi para registrar sets de iconos adicionales desde la app.
 * Se alimenta con `provideCbIcons(...)`.
 */
export const CB_ICONS = new InjectionToken<CbIconSet[]>('CB_ICONS');

/**
 * Registra un set de iconos propio del consumidor (se fusiona con el núcleo).
 * Puede llamarse varias veces; los nombres repetidos sobrescriben.
 *
 * @example
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [provideCaribeNG(), provideCbIcons({ logo: '<path d="…"/>' })],
 * });
 * ```
 */
export function provideCbIcons(icons: CbIconSet): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: CB_ICONS, useValue: icons, multi: true },
  ]);
}

/**
 * Registro de iconos de CaribeNG. Arranca con el set núcleo (`cbCoreIcons`) y
 * fusiona los sets registrados vía `provideCbIcons`. `CbIcon` lo
 * consulta por nombre.
 */
@Injectable({ providedIn: 'root' })
export class CbIconRegistry {
  private readonly icons = new Map<string, string>();

  constructor() {
    this.register(cbCoreIcons);
    const sets = inject(CB_ICONS, { optional: true }) ?? [];
    for (const set of sets) this.register(set);
  }

  /** Añade o sobrescribe iconos en el registro. */
  register(set: CbIconSet): void {
    for (const [name, body] of Object.entries(set)) {
      this.icons.set(name, body);
    }
  }

  /** Contenido SVG interno de un icono, o `undefined` si no existe. */
  get(name: string): string | undefined {
    return this.icons.get(name);
  }

  /** ¿Existe el icono en el registro? */
  has(name: string): boolean {
    return this.icons.has(name);
  }
}

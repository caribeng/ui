import { button } from './button';
import { dialog } from './dialog';
import { inputtext } from './inputtext';
import { select } from './select';
import type { ComponentMapping, ElementMapping } from './types';

/** Componentes que el migrador sabe traducir. Para añadir uno, crea su archivo y regístralo aquí. */
export const MAPPINGS: readonly ComponentMapping[] = [button, inputtext, select, dialog];

/** Símbolo CaribeNG y entry point del que se importa. */
export interface CaribeSymbol {
  readonly name: string;
  readonly entry: string;
}

/** Módulo PrimeNG → (símbolo PrimeNG → símbolo CaribeNG). */
export const SYMBOLS: ReadonlyMap<string, ReadonlyMap<string, CaribeSymbol>> = (() => {
  const index = new Map<string, Map<string, CaribeSymbol>>();
  for (const mapping of MAPPINGS) {
    for (const [module, symbols] of Object.entries(mapping.modules)) {
      const target = index.get(module) ?? new Map<string, CaribeSymbol>();
      for (const [from, to] of Object.entries(symbols)) target.set(from, { name: to, entry: mapping.entry });
      index.set(module, target);
    }
  }
  return index;
})();

/** Tag CaribeNG → símbolo que hay que importar en el componente que lo usa. */
export const TAG_SYMBOLS: ReadonlyMap<string, CaribeSymbol> = (() => {
  const index = new Map<string, CaribeSymbol>([['cb-icon', { name: 'CbIcon', entry: '@caribeng/ui/icon' }]]);
  for (const mapping of MAPPINGS) {
    const names = new Set(Object.values(mapping.modules).flatMap((symbols) => Object.values(symbols)));
    if (names.size !== 1) continue;
    const [name] = names;
    for (const element of mapping.elements) index.set(element.to, { name, entry: mapping.entry });
  }
  return index;
})();

/** Selectores por tag (`p-button`) y por directiva de atributo (`pButton`). */
export const ELEMENTS_BY_TAG: ReadonlyMap<string, ElementMapping> = new Map(
  MAPPINGS.flatMap((mapping) => mapping.elements.filter((element) => element.tag).map((element) => [element.tag!, element] as const)),
);
export const ELEMENTS_BY_ATTR: ReadonlyMap<string, ElementMapping> = new Map(
  MAPPINGS.flatMap((mapping) => mapping.elements.filter((element) => element.attr).map((element) => [element.attr!, element] as const)),
);

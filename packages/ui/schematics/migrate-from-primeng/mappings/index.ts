import { button } from './button';
import { card } from './card';
import { checkbox } from './checkbox';
import { confirmdialog, confirmpopup } from './confirm';
import { datepicker } from './datepicker';
import { dialog } from './dialog';
import { inputnumber } from './inputnumber';
import { inputtext } from './inputtext';
import { multiselect } from './multiselect';
import { radiobutton } from './radiobutton';
import { select } from './select';
import { tag } from './tag';
import { textarea } from './textarea';
import { toast } from './toast';
import { toggleswitch } from './toggleswitch';
import { tooltip } from './tooltip';
import type { ComponentMapping, DirectiveMapping, ElementMapping, SourceRewriter } from './types';

/** Componentes que el migrador sabe traducir. Para añadir uno, crea su archivo y regístralo aquí. */
export const MAPPINGS: readonly ComponentMapping[] = [
  button,
  inputtext,
  textarea,
  inputnumber,
  select,
  multiselect,
  checkbox,
  radiobutton,
  toggleswitch,
  datepicker,
  dialog,
  confirmdialog,
  confirmpopup,
  tag,
  toast,
  card,
  tooltip,
];

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
      for (const [from, to] of Object.entries(symbols)) target.set(from, typeof to === 'string' ? { name: to, entry: mapping.entry } : to);
      index.set(module, target);
    }
  }
  return index;
})();

/** Tag CaribeNG → símbolo que hay que importar en el componente que lo usa. */
export const TAG_SYMBOLS: ReadonlyMap<string, CaribeSymbol> = new Map([
  ['cb-icon', { name: 'CbIcon', entry: '@caribeng/ui/icon' }],
  ...MAPPINGS.flatMap((mapping) => mapping.elements.map((element) => [element.to, { name: mapping.symbol, entry: mapping.entry }] as const)),
]);

/** Atributo de directiva CaribeNG (`cbTooltip`) → símbolo que hay que importar. */
export const ATTR_SYMBOLS: ReadonlyMap<string, CaribeSymbol> = new Map(
  MAPPINGS.flatMap((mapping) => (mapping.directives ?? []).map((directive) => [directive.to, { name: mapping.symbol, entry: mapping.entry }] as const)),
);

/** Selectores por tag (`p-button`) y por directiva de atributo (`pButton`). */
export const ELEMENTS_BY_TAG: ReadonlyMap<string, ElementMapping> = new Map(
  MAPPINGS.flatMap((mapping) => mapping.elements.filter((element) => element.tag).map((element) => [element.tag!, element] as const)),
);
export const ELEMENTS_BY_ATTR: ReadonlyMap<string, ElementMapping> = new Map(
  MAPPINGS.flatMap((mapping) => mapping.elements.filter((element) => element.attr).map((element) => [element.attr!, element] as const)),
);

/** Directivas que se traducen sin cambiar el elemento (`pTooltip`). */
export const DIRECTIVES_BY_ATTR: ReadonlyMap<string, DirectiveMapping> = new Map(
  MAPPINGS.flatMap((mapping) => (mapping.directives ?? []).map((directive) => [directive.attr, directive] as const)),
);

/** Servicios `providedIn: 'root'` que no deben quedar en `providers`. */
export const ROOT_SERVICES: ReadonlySet<string> = new Set(MAPPINGS.flatMap((mapping) => mapping.rootServices ?? []));

/** Reescrituras de uso de servicios (`MessageService.add`…). */
export const SOURCE_REWRITERS: readonly SourceRewriter[] = MAPPINGS.flatMap((mapping) => (mapping.rewriteSource ? [mapping.rewriteSource] : []));

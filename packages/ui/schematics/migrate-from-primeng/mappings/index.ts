import { avatar } from './avatar';
import { badge } from './badge';
import { button } from './button';
import { card } from './card';
import { checkbox } from './checkbox';
import { chip } from './chip';
import { confirmdialog, confirmpopup } from './confirm';
import { datepicker } from './datepicker';
import { dialog } from './dialog';
import { divider } from './divider';
import { progressbar, progressspinner, scrolltop, skeleton } from './display';
import { floatlabel, password, rating, slider, togglebutton } from './form2';
import { inputnumber } from './inputnumber';
import { inputtext } from './inputtext';
import { image, knob, paginator, stepper, steps } from './layout2';
import { message } from './message';
import { autocomplete, carousel, colorpicker, inputmask, speeddial } from './misc';
import { iconfield, inputgroup } from './inputgroup';
import { dataview, timeline, tree } from './data';
import { breadcrumb, contextmenu, menu, menubar, panelmenu, splitbutton, tabmenu, tieredmenu } from './menu';
import { multiselect } from './multiselect';
import { drawer, popover } from './overlay';
import { fieldset, panel, toolbar } from './panel';
import { radiobutton } from './radiobutton';
import { select } from './select';
import { accordion, tabs } from './tabs';
import { table } from './table';
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
  menu,
  menubar,
  tieredmenu,
  panelmenu,
  breadcrumb,
  tabmenu,
  splitbutton,
  contextmenu,
  table,
  tabs,
  accordion,
  tag,
  toast,
  card,
  tooltip,
  // display & feedback
  badge,
  chip,
  progressbar,
  progressspinner,
  skeleton,
  scrolltop,
  avatar,
  divider,
  message,
  // containers & layout
  panel,
  fieldset,
  toolbar,
  // overlays
  drawer,
  popover,
  // form controls
  slider,
  togglebutton,
  rating,
  floatlabel,
  password,
  // pagination & media
  paginator,
  image,
  // manual (no CaribeNG equivalent yet)
  steps,
  knob,
  stepper,
  // misc form & display
  autocomplete,
  speeddial,
  colorpicker,
  inputmask,
  carousel,
  // layout helpers
  inputgroup,
  iconfield,
  // data components
  timeline,
  tree,
  dataview,
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
  ...MAPPINGS.flatMap((mapping) => mapping.elements.map((element) => [element.to, { name: element.symbol ?? mapping.symbol, entry: element.entry ?? mapping.entry }] as const)),
  ...MAPPINGS.flatMap((mapping) => Object.entries(mapping.tags ?? {}).map(([tag, name]) => [tag, { name, entry: mapping.entry }] as const)),
]);

/** Atributo de directiva CaribeNG (`cbTooltip`) → símbolo que hay que importar. */
export const ATTR_SYMBOLS: ReadonlyMap<string, CaribeSymbol> = new Map([
  ...MAPPINGS.flatMap((mapping) => (mapping.directives ?? []).map((directive) => [directive.to, { name: mapping.symbol, entry: mapping.entry }] as const)),
  ...MAPPINGS.flatMap((mapping) => Object.entries(mapping.attrs ?? {}).map(([attr, name]) => [attr, { name, entry: mapping.entry }] as const)),
]);

/** Selectores por tag (`p-button`) y por directiva de atributo (`pButton`). */
export const ELEMENTS_BY_TAG: ReadonlyMap<string, ElementMapping> = new Map(
  MAPPINGS.flatMap((mapping) => mapping.elements.filter((element) => element.tag).map((element) => [element.tag!.toLowerCase(), element] as const)),
);
export const ELEMENTS_BY_ATTR: ReadonlyMap<string, ElementMapping> = new Map(
  MAPPINGS.flatMap((mapping) => mapping.elements.filter((element) => element.attr).map((element) => [element.attr!, element] as const)),
);

/** Tag PrimeNG → su mapeo completo (para saber qué módulo PrimeNG conservar si no se convierte). */
export const MAPPING_BY_TAG: ReadonlyMap<string, ComponentMapping> = new Map(
  MAPPINGS.flatMap((mapping) => mapping.elements.filter((element) => element.tag).map((element) => [element.tag!, mapping] as const)),
);

/** Directivas que se traducen sin cambiar el elemento (`pTooltip`). */
export const DIRECTIVES_BY_ATTR: ReadonlyMap<string, DirectiveMapping> = new Map(
  MAPPINGS.flatMap((mapping) => (mapping.directives ?? []).map((directive) => [directive.attr, directive] as const)),
);

/** Servicios `providedIn: 'root'` que no deben quedar en `providers`. */
export const ROOT_SERVICES: ReadonlySet<string> = new Set(MAPPINGS.flatMap((mapping) => mapping.rootServices ?? []));

/** Reescrituras de uso de servicios (`MessageService.add`…). */
export const SOURCE_REWRITERS: readonly SourceRewriter[] = MAPPINGS.flatMap((mapping) => (mapping.rewriteSource ? [mapping.rewriteSource] : []));

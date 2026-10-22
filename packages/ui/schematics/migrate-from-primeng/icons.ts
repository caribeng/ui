import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * PrimeIcons (`pi pi-<nombre>`) → iconos de CaribeNG (nombres de Lucide).
 * Los que no están aquí se dejan con un aviso. Un test comprueba que cada
 * destino existe en el set núcleo o en el catálogo `@caribeng/ui/icons`.
 */
export const PRIME_ICONS: Readonly<Record<string, string>> = {
  check: 'check',
  'check-circle': 'circle-check',
  'check-square': 'square-check',
  times: 'x',
  'times-circle': 'circle-x',
  plus: 'plus',
  'plus-circle': 'circle-plus',
  minus: 'minus',
  'minus-circle': 'circle-minus',
  trash: 'trash',
  pencil: 'pencil',
  'pen-to-square': 'square-pen',
  'file-edit': 'file-pen',
  search: 'search',
  'search-plus': 'zoom-in',
  'search-minus': 'zoom-out',
  user: 'user',
  'user-plus': 'user-plus',
  'user-minus': 'user-minus',
  'user-edit': 'user-pen',
  users: 'users',
  home: 'house',
  cog: 'settings',
  sliders_h: 'sliders-horizontal',
  'sliders-h': 'sliders-horizontal',
  'sliders-v': 'sliders-vertical',
  bars: 'menu',
  'chevron-down': 'chevron-down',
  'chevron-up': 'chevron-up',
  'chevron-left': 'chevron-left',
  'chevron-right': 'chevron-right',
  'chevron-circle-down': 'circle-chevron-down',
  'chevron-circle-up': 'circle-chevron-up',
  'chevron-circle-left': 'circle-chevron-left',
  'chevron-circle-right': 'circle-chevron-right',
  'angle-down': 'chevron-down',
  'angle-up': 'chevron-up',
  'angle-left': 'chevron-left',
  'angle-right': 'chevron-right',
  'angle-double-down': 'chevrons-down',
  'angle-double-up': 'chevrons-up',
  'angle-double-left': 'chevrons-left',
  'angle-double-right': 'chevrons-right',
  'arrow-down': 'arrow-down',
  'arrow-up': 'arrow-up',
  'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-right',
  'arrow-up-right': 'arrow-up-right',
  'arrow-down-left': 'arrow-down-left',
  'arrow-right-arrow-left': 'arrow-left-right',
  'arrows-h': 'move-horizontal',
  'arrows-v': 'move-vertical',
  'arrows-alt': 'move',
  'sort-alt': 'arrow-up-down',
  'sort-amount-down': 'arrow-down-wide-narrow',
  'sort-amount-up': 'arrow-up-wide-narrow',
  'sort-alpha-down': 'arrow-down-a-z',
  'sort-alpha-up': 'arrow-up-a-z',
  refresh: 'refresh-cw',
  sync: 'refresh-cw',
  replay: 'rotate-ccw',
  undo: 'undo',
  history: 'rotate-ccw-clock',
  save: 'save',
  download: 'download',
  upload: 'upload',
  eye: 'eye',
  'eye-slash': 'eye-off',
  calendar: 'calendar',
  'calendar-plus': 'calendar-plus',
  'calendar-minus': 'calendar-minus',
  'calendar-times': 'calendar-x',
  clock: 'clock',
  stopwatch: 'timer',
  envelope: 'mail',
  inbox: 'inbox',
  phone: 'phone',
  mobile: 'smartphone',
  tablet: 'tablet',
  desktop: 'monitor',
  lock: 'lock',
  'lock-open': 'lock-open',
  unlock: 'lock-open',
  key: 'key',
  shield: 'shield',
  'sign-in': 'log-in',
  'sign-out': 'log-out',
  'power-off': 'power',
  info: 'info',
  'info-circle': 'info',
  question: 'circle-question-mark',
  'question-circle': 'circle-question-mark',
  exclamation: 'circle-alert',
  'exclamation-circle': 'circle-alert',
  'exclamation-triangle': 'triangle-alert',
  ban: 'ban',
  star: 'star',
  'star-fill': 'star',
  heart: 'heart',
  'heart-fill': 'heart',
  bookmark: 'bookmark',
  'bookmark-fill': 'bookmark',
  'thumbs-up': 'thumbs-up',
  'thumbs-down': 'thumbs-down',
  filter: 'funnel',
  'filter-fill': 'funnel',
  'filter-slash': 'funnel-x',
  'external-link': 'external-link',
  link: 'link',
  copy: 'copy',
  clone: 'copy',
  clipboard: 'clipboard',
  file: 'file',
  'file-pdf': 'file-text',
  'file-excel': 'file-spreadsheet',
  'file-word': 'file-text',
  'file-export': 'file-output',
  'file-import': 'file-input',
  folder: 'folder',
  'folder-open': 'folder-open',
  image: 'image',
  images: 'images',
  camera: 'camera',
  video: 'video',
  microphone: 'mic',
  'volume-up': 'volume-2',
  'volume-down': 'volume-1',
  'volume-off': 'volume-x',
  play: 'play',
  pause: 'pause',
  stop: 'square',
  'step-forward': 'skip-forward',
  'step-backward': 'skip-back',
  forward: 'fast-forward',
  backward: 'rewind',
  print: 'printer',
  'share-alt': 'share-2',
  send: 'send',
  'map-marker': 'map-pin',
  map: 'map',
  globe: 'globe',
  compass: 'compass',
  bell: 'bell',
  'bell-slash': 'bell-off',
  'shopping-cart': 'shopping-cart',
  'shopping-bag': 'shopping-bag',
  'cart-plus': 'shopping-cart',
  tag: 'tag',
  tags: 'tags',
  'ellipsis-v': 'ellipsis-vertical',
  'ellipsis-h': 'ellipsis',
  spinner: 'loader-circle',
  'spinner-dotted': 'loader',
  'circle-notch': 'loader-circle',
  sun: 'sun',
  moon: 'moon',
  comment: 'message-circle',
  comments: 'messages-square',
  wrench: 'wrench',
  hammer: 'hammer',
  database: 'database',
  server: 'server',
  'chart-bar': 'chart-column',
  'chart-line': 'chart-line',
  'chart-pie': 'chart-pie',
  'chart-scatter': 'chart-scatter',
  list: 'list',
  'list-check': 'list-checks',
  'th-large': 'layout-grid',
  table: 'table',
  paperclip: 'paperclip',
  cloud: 'cloud',
  'cloud-upload': 'cloud-upload',
  'cloud-download': 'cloud-download',
  'credit-card': 'credit-card',
  wallet: 'wallet',
  dollar: 'dollar-sign',
  euro: 'euro',
  'money-bill': 'banknote',
  percentage: 'percent',
  calculator: 'calculator',
  receipt: 'receipt',
  ticket: 'ticket',
  building: 'building',
  'building-columns': 'landmark',
  briefcase: 'briefcase',
  flag: 'flag',
  'flag-fill': 'flag',
  gift: 'gift',
  book: 'book',
  box: 'box',
  car: 'car',
  truck: 'truck',
  'id-card': 'id-card',
  verified: 'badge-check',
  megaphone: 'megaphone',
  bolt: 'zap',
  at: 'at-sign',
  hashtag: 'hash',
  palette: 'palette',
  qrcode: 'qr-code',
  expand: 'expand',
  'window-maximize': 'maximize-2',
  'window-minimize': 'minimize-2',
  sitemap: 'network',
  'objects-column': 'layout-dashboard',
  'circle-fill': 'circle',
  circle: 'circle',
  'stop-circle': 'circle-stop',
  'play-circle': 'circle-play',
  'pause-circle': 'circle-pause',
  directions: 'signpost',
  language: 'languages',
  'shield-check': 'shield-check',
};

/** Clases de PrimeIcons que no son un icono. */
const MODIFIERS = new Set(['pi', 'pi-fw', 'pi-spin']);

/** Resultado de leer las clases de un icono de PrimeIcons. */
export interface PrimeIconClasses {
  /** Nombre PrimeIcons (`check`). */
  readonly prime: string;
  /** Nombre CaribeNG, o `null` si no hay equivalente conocido. */
  readonly name: string | null;
  /** Llevaba `pi-spin`. */
  readonly spin: boolean;
  /** Resto de clases (no de PrimeIcons). */
  readonly rest: readonly string[];
}

/** Lee `"pi pi-check pi-spin mr-2"`. `null` si las clases no son de un icono de PrimeIcons. */
export function parsePrimeIcon(classes: string): PrimeIconClasses | null {
  const tokens = classes.split(/\s+/).filter(Boolean);
  if (!tokens.includes('pi')) return null;
  const icon = tokens.find((token) => token.startsWith('pi-') && !MODIFIERS.has(token));
  if (!icon) return null;
  const prime = icon.slice(3);
  return {
    prime,
    name: PRIME_ICONS[prime] ?? null,
    spin: tokens.includes('pi-spin'),
    rest: tokens.filter((token) => token !== 'pi' && !token.startsWith('pi-')),
  };
}

let coreIcons: ReadonlySet<string> | undefined;

/**
 * Iconos del set núcleo de CaribeNG (se registran solos). Los demás hay que
 * registrarlos con `provideCbIcons`. `core-icons.json` lo genera
 * `scripts/build-schematics.mjs` a partir de `icon/src/lib/icons.ts`.
 */
export function isCoreIcon(name: string): boolean {
  coreIcons ??= new Set<string>(JSON.parse(readFileSync(join(__dirname, 'core-icons.json'), 'utf8')));
  return coreIcons.has(name);
}

/** Palabras reservadas: el catálogo las exporta con prefijo (`delete` → `iconDelete`). */
const RESERVED = new Set(
  ('break case catch class const continue debugger default delete do else enum export extends false finally for ' +
    'function if import in instanceof new null return super switch this throw true try typeof var void while ' +
    'with let static yield await implements interface package private protected public').split(' '),
);

/**
 * Nombre del export del catálogo `@caribeng/ui/icons` (`arrow-down-0-1` →
 * `arrowDown01`). Misma regla que `icon/scripts/generate-icons.mjs`.
 */
export function catalogExport(name: string): string {
  const camel = name.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase());
  return /^[0-9]/.test(camel) || RESERVED.has(camel) ? `icon${camel[0].toUpperCase()}${camel.slice(1)}` : camel;
}

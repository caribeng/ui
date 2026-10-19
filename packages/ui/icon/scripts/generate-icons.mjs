// Genera los iconos de CaribeNG a partir de los SVG de Lucide. Produce DOS cosas:
//
//   1) NÚCLEO auto-registrado  -> packages/ui/icon/src/lib/icons.ts  (cbCoreIcons)
//      Curado por categorías UI de Lucide + lo que usan los componentes/showcase.
//   2) CATÁLOGO completo opt-in -> packages/ui/icons/src/lib/catalog.ts
//      Los 1891 iconos como exports nombrados (tree-shakeable).
//
// Se ejecuta UNA VEZ (manual) contra un clon local de Lucide; los resultados se
// commitean, así el build del repo NO depende del clon.
//
// Uso:  node packages/ui/icon/scripts/generate-icons.mjs [ruta-al-clon-de-lucide]
// Licencia: iconos derivados de Lucide (ISC). Ver packages/ui/THIRD-PARTY-NOTICES.md.
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const iconPkg = resolve(here, '..'); // packages/ui/icon
const catalogPkg = resolve(iconPkg, '..', 'icons'); // packages/ui/icons
const coreOut = resolve(iconPkg, 'src', 'lib', 'icons.ts');
const catalogOut = resolve(catalogPkg, 'src', 'lib', 'catalog.ts');

const lucideRoot = process.argv[2] ?? 'C:/DEVELOPER/DATA_COPY/lucide';
const iconsDir = resolve(lucideRoot, 'icons');
if (!existsSync(iconsDir)) throw new Error(`No se encontró el clon de Lucide en: ${iconsDir}`);
mkdirSync(dirname(coreOut), { recursive: true });
mkdirSync(dirname(catalogOut), { recursive: true });

// Tamaño objetivo del NÚCLEO auto-registrado (se llena por prioridad hasta aquí).
const CORE_TARGET = 360;

// Categorías de Lucide, en ORDEN DE PRIORIDAD, para llenar el núcleo (UI/producto).
const CORE_PRIORITY = [
  'arrows', 'navigation', 'shapes', 'account', 'communication', 'mail',
  'notifications', 'time', 'files', 'text', 'layout', 'security', 'charts',
  'finance', 'shopping', 'tools', 'media', 'multimedia', 'connectivity',
  'devices', 'design', 'math', 'accessibility', 'cursors',
];

// Iconos que SIEMPRE deben estar en el núcleo (los usan componentes/showcase),
// aunque su categoría no esté arriba.
const MUST_HAVE = [
  'chevron-down', 'chevron-up', 'chevron-left', 'chevron-right', 'chevrons-up-down',
  'check', 'check-check', 'x', 'plus', 'minus', 'search', 'menu',
  'info', 'circle-check', 'circle-x', 'circle-alert', 'triangle-alert',
  'loader-circle', 'eye', 'eye-off', 'copy', 'external-link', 'settings', 'funnel',
  'user', 'users', 'bell', 'mail', 'house', 'calendar', 'calendar-days', 'clock',
  'star', 'heart', 'file', 'folder', 'image', 'lock', 'log-out', 'sun', 'moon',
  'palette', 'circle', 'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right',
  'trash', 'pencil', 'download', 'upload', 'clipboard', 'save', 'refresh-cw',
  'rotate-cw', 'rotate-ccw', 'flip-horizontal', 'flip-vertical',
  // Tarjetas del showcase:
  'zap', 'puzzle', 'accessibility', 'plug', 'tree-pine', 'sparkles', 'shield-check',
];

// Alias: clave en CaribeNG -> archivo de Lucide.
const ALIASES = { loader: 'loader-circle' };

// --- Utilidades ---------------------------------------------------------------
function innerSvg(file) {
  const raw = readFileSync(file, 'utf8');
  const open = raw.indexOf('>');
  const close = raw.lastIndexOf('</svg>');
  return raw.slice(open + 1, close).split('\n').map((l) => l.trim()).filter(Boolean).join('');
}
const RESERVED = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
  'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for',
  'function', 'if', 'import', 'in', 'instanceof', 'new', 'null', 'return', 'super',
  'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while',
  'with', 'let', 'static', 'yield', 'await', 'implements', 'interface', 'package',
  'private', 'protected', 'public',
]);
function camel(name) {
  const c = name.replace(/-([a-z0-9])/g, (_, ch) => ch.toUpperCase());
  if (/^[0-9]/.test(c) || RESERVED.has(c)) {
    return `icon${c[0].toUpperCase()}${c.slice(1)}`;
  }
  return c;
}

// Todos los svg + su contenido interno.
const files = readdirSync(iconsDir).filter((f) => f.endsWith('.svg')).map((f) => f.replace(/\.svg$/, ''));
const inner = new Map(files.map((n) => [n, innerSvg(resolve(iconsDir, `${n}.svg`))]));

// Categorías por icono (desde icons/<name>.json).
function categoriesOf(name) {
  const j = resolve(iconsDir, `${name}.json`);
  if (!existsSync(j)) return [];
  try {
    return JSON.parse(readFileSync(j, 'utf8')).categories ?? [];
  } catch {
    return [];
  }
}

// --- NÚCLEO -------------------------------------------------------------------
// Índice inverso categoría -> iconos.
const byCat = new Map();
for (const n of files) {
  for (const c of categoriesOf(n)) {
    if (!byCat.has(c)) byCat.set(c, []);
    byCat.get(c).push(n);
  }
}

const coreNames = new Set();
// 1) Imprescindibles (siempre).
for (const n of MUST_HAVE) {
  if (!inner.has(n)) throw new Error(`MUST_HAVE no existe en Lucide: ${n}`);
  coreNames.add(n);
}
// 2) Llenar por prioridad de categorías hasta CORE_TARGET.
outer: for (const cat of CORE_PRIORITY) {
  const members = (byCat.get(cat) ?? []).slice().sort();
  for (const n of members) {
    if (coreNames.size >= CORE_TARGET) break outer;
    coreNames.add(n);
  }
}

// Construye el mapa final del núcleo (con alias; clave kebab).
const coreEntries = [];
for (const name of [...coreNames].sort()) coreEntries.push([name, inner.get(name)]);
for (const [alias, file] of Object.entries(ALIASES)) {
  if (inner.has(file)) coreEntries.push([alias, inner.get(file)]);
}
coreEntries.sort((a, b) => a[0].localeCompare(b[0]));

const coreBody = coreEntries
  .map(([name, body]) => `  ${JSON.stringify(name)}: ${JSON.stringify(body)},`)
  .join('\n');

writeFileSync(
  coreOut,
  `/*
 * Set NÚCLEO de iconos de CaribeNG (auto-registrado).
 *
 * ⚠️ ARCHIVO GENERADO — no editar a mano.
 * Regenerar: node packages/ui/icon/scripts/generate-icons.mjs [ruta-clon-lucide]
 *
 * Iconos DERIVADOS de Lucide (https://lucide.dev), licencia ISC.
 * Copyright (c) Lucide Icons and Contributors. Ver packages/ui/THIRD-PARTY-NOTICES.md.
 *
 * ¿Necesitas más? Usa el catálogo completo (1891) opt-in: @caribeng/ui/icons.
 */
export type CbIconSet = Record<string, string>;

export const cbCoreIcons: CbIconSet = {
${coreBody}
};

/** Nombres del set núcleo (para tipado/autocompletado). */
export type CbCoreIconName = keyof typeof cbCoreIcons;
`,
  'utf8',
);

// --- CATÁLOGO completo (1891) -------------------------------------------------
const catBody = files
  .slice()
  .sort()
  .map((n) => `export const ${camel(n)} = ${JSON.stringify(inner.get(n))};`)
  .join('\n');

writeFileSync(
  catalogOut,
  `/*
 * Catálogo COMPLETO de iconos de CaribeNG (${files.length}), opt-in y tree-shakeable.
 *
 * ⚠️ ARCHIVO GENERADO — no editar a mano.
 * Regenerar: node packages/ui/icon/scripts/generate-icons.mjs [ruta-clon-lucide]
 *
 * Iconos DERIVADOS de Lucide (https://lucide.dev), licencia ISC.
 * Copyright (c) Lucide Icons and Contributors. Ver packages/ui/THIRD-PARTY-NOTICES.md.
 *
 * Cada export es el contenido interno de un SVG 24×24 (stroke). Importa solo los
 * que uses y regístralos con provideCbIcons:
 *
 *   import { heartPulse } from '@caribeng/ui/icons';
 *   provideCbIcons({ 'heart-pulse': heartPulse });
 *   // luego:  <cb-icon name="heart-pulse" />
 */
${catBody}
`,
  'utf8',
);

console.log(`[icons] núcleo: ${coreEntries.length} iconos -> ${coreOut}`);
console.log(`[icons] catálogo: ${files.length} iconos -> ${catalogOut}`);

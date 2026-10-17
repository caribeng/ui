// Genera el set núcleo de iconos de CaribeNG a partir de los SVG de Lucide.
//
// Se ejecuta UNA VEZ (manualmente) contra un clon local de Lucide; el resultado
// (`src/lib/icons.ts`) se commitea, así el build del repo NO depende del clon.
//
// Uso:  node packages/ui/icon/scripts/generate-icons.mjs [ruta-al-clon-de-lucide]
// Por defecto: C:/DEVELOPER/DATA_COPY/lucide
//
// Licencia: los iconos derivan de Lucide (ISC). Ver packages/ui/THIRD-PARTY-NOTICES.md.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, '..'); // packages/ui/icon
const outFile = resolve(pkgRoot, 'src', 'lib', 'icons.ts');

const lucideRoot = process.argv[2] ?? 'C:/DEVELOPER/DATA_COPY/lucide';
const iconsDir = resolve(lucideRoot, 'icons');

/**
 * Set curado. Clave = nombre del icono en CaribeNG; valor = archivo de Lucide
 * (sin extensión). Casi siempre coinciden; algunos difieren por renombres de
 * Lucide o por preferencia (p. ej. `loader` usa la geometría de `loader-circle`).
 */
const CURATED = {
  // Chevrons y navegación
  'chevron-down': 'chevron-down',
  'chevron-up': 'chevron-up',
  'chevron-left': 'chevron-left',
  'chevron-right': 'chevron-right',
  'chevrons-up-down': 'chevrons-up-down',
  'arrow-up': 'arrow-up',
  'arrow-down': 'arrow-down',
  'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-right',
  menu: 'menu',
  ellipsis: 'ellipsis',
  'ellipsis-vertical': 'ellipsis-vertical',

  // Marcas básicas
  check: 'check',
  'check-check': 'check-check',
  x: 'x',
  plus: 'plus',
  minus: 'minus',
  'circle-plus': 'circle-plus',
  'circle-minus': 'circle-minus',
  search: 'search',

  // Estado / severidad
  info: 'info',
  'circle-check': 'circle-check',
  'circle-x': 'circle-x',
  'circle-alert': 'circle-alert',
  'triangle-alert': 'triangle-alert',
  loader: 'loader-circle',

  // Visibilidad
  eye: 'eye',
  'eye-off': 'eye-off',

  // Acciones de archivo / edición
  download: 'download',
  upload: 'upload',
  trash: 'trash',
  pencil: 'pencil',
  copy: 'copy',
  clipboard: 'clipboard',
  save: 'save',
  'refresh-cw': 'refresh-cw',

  // Configuración / enlaces
  settings: 'settings',
  funnel: 'funnel',
  'external-link': 'external-link',
  link: 'link',

  // Personas / comunicación
  user: 'user',
  users: 'users',
  bell: 'bell',
  mail: 'mail',

  // Objetos
  house: 'house',
  calendar: 'calendar',
  'calendar-days': 'calendar-days',
  clock: 'clock',
  star: 'star',
  heart: 'heart',
  file: 'file',
  folder: 'folder',
  image: 'image',
  lock: 'lock',

  // Sesión / tema
  'log-out': 'log-out',
  sun: 'sun',
  moon: 'moon',
  palette: 'palette',
  circle: 'circle',
};

/** Extrae el contenido interno de un `<svg>` y lo compacta a una línea. */
function innerSvg(file) {
  const raw = readFileSync(file, 'utf8');
  const open = raw.indexOf('>');
  const close = raw.lastIndexOf('</svg>');
  if (open < 0 || close < 0) throw new Error(`SVG inválido: ${file}`);
  return raw
    .slice(open + 1, close)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('');
}

if (!existsSync(iconsDir)) {
  throw new Error(`No se encontró el clon de Lucide en: ${iconsDir}`);
}

const entries = [];
const missing = [];
for (const [name, file] of Object.entries(CURATED)) {
  const svg = resolve(iconsDir, `${file}.svg`);
  if (!existsSync(svg)) {
    missing.push(`${name} -> ${file}.svg`);
    continue;
  }
  entries.push([name, innerSvg(svg)]);
}

if (missing.length) {
  throw new Error(`Iconos no encontrados en Lucide:\n  ${missing.join('\n  ')}`);
}

entries.sort((a, b) => a[0].localeCompare(b[0]));

const body = entries
  .map(([name, inner]) => `  ${JSON.stringify(name)}: ${JSON.stringify(inner)},`)
  .join('\n');

const out = `/*
 * Set núcleo de iconos de CaribeNG.
 *
 * ⚠️ ARCHIVO GENERADO — no editar a mano.
 * Regenerar: node packages/ui/icon/scripts/generate-icons.mjs [ruta-clon-lucide]
 *
 * Los iconos DERIVAN de Lucide (https://lucide.dev), licencia ISC.
 * Copyright (c) Lucide Icons and Contributors. Ver packages/ui/THIRD-PARTY-NOTICES.md.
 *
 * Cada valor es el contenido interno de un SVG en grilla 24×24 con trazo
 * (\`stroke\`). El wrapper (\`<svg viewBox="0 0 24 24" stroke="currentColor" …>\`)
 * lo añade \`CbIconComponent\`; por eso heredan \`currentColor\` y escalan.
 */
export type CbIconSet = Record<string, string>;

export const cbCoreIcons: CbIconSet = {
${body}
};

/** Nombres de los iconos del set núcleo (para tipado/autocompletado). */
export type CbCoreIconName = keyof typeof cbCoreIcons;
`;

writeFileSync(outFile, out, 'utf8');
console.log(`[icons] generados ${entries.length} iconos -> ${outFile}`);

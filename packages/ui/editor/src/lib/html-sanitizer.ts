/**
 * Saneador y normalizador del HTML del editor.
 *
 * Deja solo una lista blanca de etiquetas y atributos (sin scripts, eventos,
 * estilos arbitrarios ni URLs peligrosas) y normaliza el resultado para que sea
 * igual en todos los navegadores: `<b>` → `<strong>`, `<i>` → `<em>`, `<div>` →
 * `<p>`, texto suelto dentro de párrafos y `''` cuando no hay contenido.
 *
 * Los únicos estilos que sobreviven son los que el editor sabe producir y que
 * no pueden romper la página: alineación de bloques, ancho y alineación de
 * imágenes, y colores (texto y fondo) dentro de bloques de código, para
 * conservar el resaltado al pegar desde VS Code.
 *
 * Se aplica al cargar un valor, al pegar y al emitir el valor del editor.
 */
import { CB_EDITOR_FONTS, fontStacks, matchFont } from './editor-fonts';

/** Tipografías permitidas en la llamada en curso (el saneado es síncrono). */
const DEFAULT_FONTS = fontStacks(CB_EDITOR_FONTS);
let allowedFonts: readonly string[] = DEFAULT_FONTS;

/** Etiquetas permitidas y sus atributos. */
const ALLOWED: Record<string, readonly string[]> = {
  p: ['style'],
  h1: ['style', 'id'],
  h2: ['style', 'id'],
  h3: ['style', 'id'],
  h4: ['style', 'id'],
  blockquote: ['style'],
  pre: ['style', 'data-language', 'data-highlight'],
  figure: ['style'],
  figcaption: [],
  details: ['open'],
  summary: [],
  nav: ['data-type'],
  ul: ['data-type'],
  ol: ['start'],
  li: ['style', 'data-checked'],
  hr: [],
  br: [],
  strong: [],
  em: [],
  u: [],
  s: [],
  code: [],
  sub: [],
  sup: [],
  a: ['href', 'target', 'rel', 'title'],
  img: ['src', 'alt', 'width', 'height', 'title', 'style'],
  table: ['style'],
  caption: [],
  thead: [],
  tbody: [],
  tfoot: [],
  tr: [],
  th: ['colspan', 'rowspan', 'scope', 'style'],
  td: ['colspan', 'rowspan', 'style'],
};

/** Equivalencias que se normalizan (mismo significado, otra etiqueta). */
const RENAME: Record<string, string> = {
  b: 'strong',
  i: 'em',
  strike: 's',
  del: 's',
  ins: 'u',
  div: 'p',
  h5: 'h4',
  h6: 'h4',
};

/** Etiquetas que se eliminan con todo su contenido. */
const DROP = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'noscript', 'template', 'svg', 'math',
  'form', 'input', 'button', 'select', 'textarea', 'head', 'title', 'meta', 'link', 'xml',
  'colgroup', 'col',
]);

const BLOCKS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'pre', 'ul', 'ol', 'hr', 'table', 'figure', 'details', 'nav']);
const ALIGN = new Set(['left', 'center', 'right', 'justify']);
const TABLE_PARTS = new Set(['thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption']);
const INLINE = new Set(['strong', 'em', 'u', 's', 'code', 'sub', 'sup']);

/** ¿Es una URL segura para un enlace? (http, https, mailto, tel y rutas relativas). */
export function isSafeUrl(url: string): boolean {
  const value = url.trim().replace(/[\u0000-\u001F\u007F\s]+/g, '');
  if (!value) return false;
  if (/^(#|\/(?!\/)|\.\.?\/)/.test(value)) return true;
  return /^(https?:\/\/|mailto:|tel:)/i.test(value);
}

/** ¿Es una fuente de imagen segura? (http, https, relativa o data: de imagen rasterizada). */
export function isSafeImageSrc(src: string): boolean {
  const value = src.trim();
  if (/^data:image\/(png|jpe?g|gif|webp|avif);base64,[a-z0-9+/=\s]+$/i.test(value)) return true;
  if (/^data:/i.test(value)) return false;
  return /^(https?:\/\/|\/(?!\/)|\.\.?\/)/i.test(value) || /^[\w-]+(\/[\w.-]+)*\.(png|jpe?g|gif|webp|avif)$/i.test(value);
}

/** Color CSS sin funciones peligrosas: #hex, rgb(), rgba(), hsl(), hsla() o un nombre. */
function safeColor(value: string | undefined): string | null {
  const v = value?.trim();
  if (!v || /^(transparent|inherit|initial|unset|revert|currentcolor|none|auto)$/i.test(v)) return null;
  return /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%/]+\)|hsla?\([\d\s.,%/deg]+\)|[a-z]{3,20})$/i.test(v) ? v : null;
}

/** Tamaños de letra del selector del editor (en px). */
export const CB_FONT_SIZES = [10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48] as const;

/** Palabras clave de CSS y `<font size>` → px. */
const FONT_KEYWORDS: Record<string, number> = {
  'xx-small': 9,
  'x-small': 10,
  small: 13,
  smaller: 13,
  large: 18,
  larger: 18,
  'x-large': 24,
  'xx-large': 32,
  'xxx-large': 48,
  '1': 10,
  '2': 13,
  '4': 18,
  '5': 24,
  '6': 32,
  '7': 48,
};

/**
 * Tamaño de letra en px entre 8 y 96 (acepta px, pt de Word, palabras clave y `<font size>`);
 * `em` / `rem` se conservan entre 0.5 y 6. Lo demás se descarta.
 */
function safeFontSize(value: string | null | undefined): string | null {
  const v = value?.trim().toLowerCase();
  if (!v) return null;
  if (FONT_KEYWORDS[v]) return `${FONT_KEYWORDS[v]}px`;
  const m = /^(\d+(?:\.\d+)?)(px|pt|r?em)$/.exec(v);
  if (!m) return null;
  const n = Number(m[1]);
  if (m[2].endsWith('em')) return n >= 0.5 && n <= 6 ? `${n}${m[2]}` : null;
  const px = Math.round(m[2] === 'pt' ? (n * 4) / 3 : n);
  return px >= 8 && px <= 96 ? `${px}px` : null;
}

/** Tipografía: solo una de las permitidas (se guarda su pila CSS completa). */
function safeFontFamily(value: string | null | undefined): string | null {
  return matchFont(value, allowedFonts);
}

/** Estilo de un bloque: alineación y sangría (en múltiplos de 2rem, hasta 10rem). */
function blockStyle(style: string): string {
  const parts: string[] = [];
  const align = styleProp(style, 'text-align')?.toLowerCase();
  if (align && ALIGN.has(align) && align !== 'left') parts.push(`text-align: ${align}`);
  const indent = /^(\d{1,2}(\.\d+)?)rem$/.exec(styleProp(style, 'margin-left') ?? '');
  if (indent) {
    const steps = Math.min(5, Math.max(0, Math.round(Number(indent[1]) / 2)));
    if (steps) parts.push(`margin-left: ${steps * 2}rem`);
  }
  return parts.join('; ');
}

/** Lee una declaración de un atributo `style` (`prop: valor`). */
function styleProp(style: string, prop: string): string | undefined {
  const match = new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, 'i').exec(style);
  return match?.[1].trim();
}

/** Alineación de una imagen: `left`/`right` (flotante, el texto la rodea) o `center` (bloque centrado). */
export type CbImageAlign = 'left' | 'center' | 'right';

/** Estilo normalizado de una imagen a partir de su ancho y alineación. */
export function imageStyle(width: string | null, align: CbImageAlign | null): string {
  const parts: string[] = [];
  if (width) parts.push(`width: ${width}`, 'height: auto');
  if (align === 'left') parts.push('float: left', 'margin: 0 1rem 0.5rem 0');
  else if (align === 'right') parts.push('float: right', 'margin: 0 0 0.5rem 1rem');
  else if (align === 'center') parts.push('display: block', 'margin: 0.5rem auto');
  return parts.join('; ');
}

/** Ancho y alineación que expresa el estilo de una imagen. */
export function readImageStyle(style: string): { width: string | null; align: CbImageAlign | null } {
  const rawWidth = styleProp(style, 'width');
  const width = rawWidth && /^\d{1,4}(\.\d+)?(%|px)$/.test(rawWidth) && parseFloat(rawWidth) > 0 ? rawWidth : null;
  const float = styleProp(style, 'float')?.toLowerCase();
  const display = styleProp(style, 'display')?.toLowerCase();
  const margin = styleProp(style, 'margin') ?? '';
  const align: CbImageAlign | null =
    float === 'left' || float === 'right' ? float : display === 'block' && /auto/.test(margin) ? 'center' : null;
  return { width, align };
}

/** Bordes de una tabla: todos, solo líneas horizontales o ninguno. */
export type CbTableBorders = 'all' | 'horizontal' | 'none';

/** Borde `1px solid <color>` (también dashed / dotted, 1–4 px) o `null` si no es seguro. */
function safeBorder(value: string | undefined): string | null {
  const match = /^([1-4])px\s+(solid|dashed|dotted)\s+(.+)$/i.exec(value?.trim() ?? '');
  if (!match) return null;
  const color = safeColor(match[3]);
  return color ? `${match[1]}px ${match[2].toLowerCase()} ${color}` : null;
}

/** Estilo de una tabla: solo `border-collapse: collapse` y el ancho. */
function tableStyle(style: string): string {
  const parts: string[] = [];
  if (/border-collapse\s*:\s*collapse/i.test(style)) parts.push('border-collapse: collapse');
  const width = styleProp(style, 'width');
  if (width && /^\d{1,4}(\.\d+)?(%|px)$/.test(width)) parts.push(`width: ${width}`);
  return parts.join('; ');
}

/** Estilo de una celda: alineación, bordes (todos o el inferior) y color de fondo. */
export function cellStyle(style: string): string {
  const parts: string[] = [];
  const align = styleProp(style, 'text-align')?.toLowerCase();
  if (align && ALIGN.has(align) && align !== 'left') parts.push(`text-align: ${align}`);
  const border = safeBorder(styleProp(style, 'border'));
  const bottom = safeBorder(styleProp(style, 'border-bottom'));
  if (border) parts.push(`border: ${border}`);
  else if (bottom) parts.push(`border-bottom: ${bottom}`);
  const background = safeColor(styleProp(style, 'background-color'));
  if (background) parts.push(`background-color: ${background}`);
  return parts.join('; ');
}

/** Estilo de celda con los bordes indicados (conserva alineación y fondo). */
export function withCellBorders(style: string, borders: CbTableBorders, color: string): string {
  const current = cellStyle(style);
  const align = styleProp(current, 'text-align');
  const background = styleProp(current, 'background-color');
  const border = borders === 'all' ? `border: 1px solid ${color}` : borders === 'horizontal' ? `border-bottom: 1px solid ${color}` : '';
  return cellStyle([align && `text-align: ${align}`, border, background && `background-color: ${background}`].filter(Boolean).join('; '));
}

/** Bordes y color que tiene una celda. */
export function readCellBorders(style: string): { borders: CbTableBorders; color: string | null } {
  const border = safeBorder(styleProp(style, 'border'));
  const bottom = safeBorder(styleProp(style, 'border-bottom'));
  const value = border ?? bottom;
  return { borders: border ? 'all' : bottom ? 'horizontal' : 'none', color: value ? value.replace(/^\S+\s+\S+\s+/, '') : null };
}

export interface CbSanitizeOptions {
  /** Permite imágenes (por defecto true). */
  images?: boolean;
  /**
   * Tipografías permitidas (pilas CSS, p. ej. `"'Open Sans', sans-serif"`). Una tipografía
   * se reconoce por su primer nombre; las demás se quitan. Por defecto, las del editor.
   */
  fonts?: readonly string[];
}

/** Devuelve el HTML saneado y normalizado; `''` si no hay texto ni imágenes. */
export function cbSanitizeHtml(html: string | null | undefined, options: CbSanitizeOptions = {}): string {
  if (!html || typeof document === 'undefined') return '';
  const images = options.images !== false;
  allowedFonts = options.fonts ?? DEFAULT_FONTS;
  try {
    // <template> no ejecuta scripts ni carga imágenes al parsear.
    const template = document.createElement('template');
    template.innerHTML = cleanOffice(html);
    const out = document.createElement('div');
    for (const node of Array.from(template.content.childNodes)) appendClean(out, node, images);
    wrapInlineRuns(out);
    removeEmptyBlocks(out);
    return isEmptyContent(out) ? '' : out.innerHTML;
  } finally {
    allowedFonts = DEFAULT_FONTS;
  }
}

/** Texto plano del HTML (para contar caracteres o guardar un resumen). */
export function cbHtmlToText(html: string | null | undefined): string {
  if (!html || typeof document === 'undefined') return '';
  const template = document.createElement('template');
  template.innerHTML = html;
  const parts: string[] = [];
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) parts.push(node.textContent ?? '');
    else if (node.nodeName === 'BR') parts.push('\n');
    node.childNodes.forEach(walk);
    const tag = node.nodeName.toLowerCase();
    if (node.nodeType === Node.ELEMENT_NODE && BLOCKS.has(tag) && tag !== 'ul' && tag !== 'ol' && tag !== 'table') parts.push('\n');
    if (tag === 'li' || tag === 'tr') parts.push('\n');
    if (tag === 'td' || tag === 'th') parts.push('\t');
  };
  template.content.childNodes.forEach(walk);
  return parts.join('').replace(/ /g, ' ').replace(/\t\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Restos de Word / Office: comentarios condicionales, `<o:p>`, `mso-*`. */
function cleanOffice(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?o:p[^>]*>/gi, '')
    .replace(/<\/?(w|m|v):[^>]*>/gi, '');
}

/** El elemento conserva los espacios (`white-space: pre`): es código (p. ej. lo que copia VS Code). */
function isPreformatted(style: string): boolean {
  return /white-space\s*:\s*pre/i.test(style);
}

/** Estilo de color permitido dentro de un bloque de código. */
function codeStyle(style: string, withBackground: boolean): string {
  const parts: string[] = [];
  const color = safeColor(styleProp(style, 'color'));
  if (color) parts.push(`color: ${color}`);
  if (withBackground) {
    const background = safeColor(styleProp(style, 'background-color') ?? styleProp(style, 'background'));
    if (background) parts.push(`background-color: ${background}`);
  }
  if (/font-weight\s*:\s*(bold|[6-9]00)/i.test(style)) parts.push('font-weight: bold');
  if (/font-style\s*:\s*italic/i.test(style)) parts.push('font-style: italic');
  return parts.join('; ');
}

function appendClean(parent: HTMLElement, node: Node, images: boolean): void {
  if (node.nodeType === Node.TEXT_NODE) {
    parent.append(node.textContent ?? '');
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const source = node as HTMLElement;
  let tag = source.tagName.toLowerCase();
  if (DROP.has(tag)) return;
  const style = source.getAttribute('style') ?? '';
  const inCode = hasAncestor(parent, 'pre');

  // Dentro de un bloque de código: texto literal, una línea por bloque y colores.
  if (inCode) {
    appendCode(parent, source);
    return;
  }

  // Un contenedor con white-space: pre (VS Code, otros editores) es un bloque de código.
  if (tag === 'pre' || (isPreformatted(style) && tag !== 'span')) {
    const pre = document.createElement('pre');
    const preStyle = codeStyle(style, true);
    if (preStyle) pre.setAttribute('style', preStyle);
    const language = source.getAttribute('data-language');
    if (language && /^[\w+#.-]{1,30}$/.test(language)) pre.setAttribute('data-language', language);
    // Bloque coloreado por el propio editor (se vuelve a colorear al editarlo).
    if (source.getAttribute('data-highlight') === 'auto') pre.setAttribute('data-highlight', 'auto');
    const code = document.createElement('code');
    pre.append(code);
    appendCode(code, source, true);
    trimTrailingNewline(code);
    if (parent.tagName === 'P') parent.after(pre);
    else parent.append(pre);
    return;
  }

  // Mención (@persona): un <span data-mention> con solo su texto.
  if (tag === 'span' && /^[\w.@:-]{1,64}$/.test(source.getAttribute('data-mention') ?? '') && !inCode) {
    const mention = document.createElement('span');
    mention.setAttribute('data-mention', source.getAttribute('data-mention')!);
    mention.textContent = (source.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (mention.textContent) parent.append(mention);
    return;
  }

  // Google Docs envuelve todo en <b style="font-weight:normal">: no es negrita.
  if (tag === 'b' && /font-weight\s*:\s*(normal|[1-4]00)/i.test(style)) tag = 'span';
  // Estilos en línea que equivalen a etiquetas (lo que pega Google Docs).
  if (tag === 'span' || tag === 'font') {
    const wrappers: string[] = [];
    if (/font-weight\s*:\s*(bold|[6-9]00)/i.test(style)) wrappers.push('strong');
    if (/font-style\s*:\s*italic/i.test(style)) wrappers.push('em');
    if (/text-decoration[^;]*underline/i.test(style)) wrappers.push('u');
    if (/text-decoration[^;]*line-through/i.test(style)) wrappers.push('s');
    let target: HTMLElement = parent;
    for (const w of wrappers) {
      if (hasAncestor(target, w)) continue;
      const el = document.createElement(w);
      target.append(el);
      target = el;
    }
    // Color de texto, resaltado, tamaño y tipografía (lo único que guarda un <span>).
    const inline = [
      ['color', safeColor(styleProp(style, 'color') ?? source.getAttribute('color') ?? undefined)],
      ['background-color', safeColor(styleProp(style, 'background-color') ?? styleProp(style, 'background'))],
      ['font-size', safeFontSize(styleProp(style, 'font-size') ?? (tag === 'font' ? source.getAttribute('size') : null))],
      ['font-family', safeFontFamily(styleProp(style, 'font-family') ?? (tag === 'font' ? source.getAttribute('face') : null))],
    ].filter((d): d is [string, string] => !!d[1]);
    if (inline.length) {
      const span = document.createElement('span');
      span.setAttribute('style', inline.map(([k, v]) => `${k}: ${v}`).join('; '));
      target.append(span);
      target = span;
    }
    for (const child of Array.from(source.childNodes)) appendClean(target, child, images);
    if (target !== parent && !target.textContent && !target.querySelector('img, br')) target.remove();
    return;
  }
  tag = RENAME[tag] ?? tag;
  if (tag === 'img' && !images) return;
  if (!ALLOWED[tag]) {
    // Etiqueta no permitida: se conserva su contenido.
    for (const child of Array.from(source.childNodes)) appendClean(parent, child, images);
    return;
  }
  // Partes de tabla fuera de una tabla: se conserva solo su contenido.
  if (TABLE_PARTS.has(tag) && !hasAncestor(parent, 'table') && tag !== 'caption') {
    for (const child of Array.from(source.childNodes)) appendClean(parent, child, images);
    return;
  }
  // Un bloque dentro de un párrafo (p. ej. <div> dentro de <p>) se aplana.
  if (tag === 'p' && /^(P|TD|TH|LI|FIGCAPTION|SUMMARY)$/.test(parent.tagName)) {
    if (parent.childNodes.length) parent.append(document.createElement('br'));
    for (const child of Array.from(source.childNodes)) appendClean(parent, child, images);
    return;
  }
  if ((tag === 'figcaption' && parent.tagName !== 'FIGURE') || (tag === 'summary' && parent.tagName !== 'DETAILS')) {
    const p = document.createElement('p');
    for (const child of Array.from(source.childNodes)) appendClean(p, child, images);
    parent.append(p);
    return;
  }
  if (tag === 'nav' && source.getAttribute('data-type') !== 'toc') {
    for (const child of Array.from(source.childNodes)) appendClean(parent, child, images);
    return;
  }
  const el = document.createElement(tag);
  for (const name of ALLOWED[tag]) {
    const value = source.getAttribute(name);
    if (value === null) continue;
    if (name === 'style') {
      if (tag === 'img' || tag === 'figure') {
        const { width, align } = readImageStyle(value);
        const css = imageStyle(width, align);
        if (css) el.setAttribute('style', css);
      } else if (tag === 'table') {
        const css = tableStyle(value);
        if (css) el.setAttribute('style', css);
      } else if (tag === 'td' || tag === 'th') {
        const css = cellStyle(value);
        if (css) el.setAttribute('style', css);
      } else {
        const css = blockStyle(value);
        if (css) el.setAttribute('style', css);
      }
    } else if (name === 'href') {
      if (isSafeUrl(value)) el.setAttribute('href', value.trim());
    } else if (name === 'src') {
      if (isSafeImageSrc(value)) el.setAttribute('src', value.trim());
    } else if (name === 'target') {
      if (value === '_blank') el.setAttribute('target', '_blank');
    } else if (name === 'width' || name === 'height' || name === 'start' || name === 'colspan' || name === 'rowspan') {
      if (/^\d{1,4}$/.test(value) && Number(value) > 0) el.setAttribute(name, value);
    } else if (name === 'data-type') {
      if ((tag === 'ul' && value === 'taskList') || (tag === 'nav' && value === 'toc')) el.setAttribute('data-type', value);
    } else if (name === 'data-highlight') {
      if (value === 'auto') el.setAttribute('data-highlight', 'auto');
    } else if (name === 'id') {
      if (/^[a-z][a-z0-9-]{0,79}$/.test(value)) el.setAttribute('id', value);
    } else if (name === 'open') {
      el.setAttribute('open', '');
    } else if (name === 'data-checked') {
      if (value === 'true' || value === 'false') el.setAttribute('data-checked', value);
    } else if (name === 'scope') {
      if (/^(col|row|colgroup|rowgroup)$/.test(value)) el.setAttribute('scope', value);
    } else if (name !== 'rel') {
      el.setAttribute(name, value);
    }
  }
  if (tag === 'a') {
    if (!el.hasAttribute('href')) {
      for (const child of Array.from(source.childNodes)) appendClean(parent, child, images);
      return;
    }
    if (el.getAttribute('target') === '_blank') el.setAttribute('rel', 'noopener noreferrer');
  }
  if (tag === 'img') {
    if (!el.hasAttribute('src')) return;
    // Con ancho en el estilo, los atributos de tamaño deformarían la imagen.
    if (el.style.width) {
      el.removeAttribute('width');
      el.removeAttribute('height');
    }
  }
  if (tag === 'li' && parent.tagName !== 'UL' && parent.tagName !== 'OL') {
    // <li> suelto: se convierte en párrafo.
    const p = document.createElement('p');
    for (const child of Array.from(source.childNodes)) appendClean(p, child, images);
    parent.append(p);
    return;
  }
  // Formato repetido (<strong> dentro de <strong>): se aplana.
  if (INLINE.has(tag) && hasAncestor(parent, tag)) {
    for (const child of Array.from(source.childNodes)) appendClean(parent, child, images);
    return;
  }
  // Se engancha antes de recorrer los hijos: así saben dónde están (p. ej. una fila, dentro de una tabla).
  parent.append(el);
  for (const child of Array.from(source.childNodes)) appendClean(el, child, images);
  if (tag === 'table') normalizeTable(el);
  // Una figura sin imagen no es una figura: se queda su contenido.
  if (tag === 'figure' && !el.querySelector('img')) {
    for (const child of Array.from(el.childNodes)) {
      if ((child as Element).tagName === 'FIGCAPTION') {
        const p = document.createElement('p');
        p.append(...Array.from(child.childNodes));
        el.before(p);
      } else el.before(child);
    }
    el.remove();
  }
  if (tag === 'li' && parent.getAttribute('data-type') === 'taskList' && !el.hasAttribute('data-checked')) el.setAttribute('data-checked', 'false');
  if (tag === 'li' && parent.getAttribute('data-type') !== 'taskList') el.removeAttribute('data-checked');
}

/**
 * Copia el contenido de un bloque de código: el texto tal cual, `<br>` y los
 * bloques interiores (una línea cada uno, como los `<div>` de VS Code) como
 * saltos de línea, y los `<span>` con su color.
 */
function appendCode(target: HTMLElement, source: Node, isRoot = false): void {
  for (const node of Array.from(source.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      target.append(node.textContent ?? '');
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (DROP.has(tag)) continue;
    if (tag === 'br') {
      target.append('\n');
      continue;
    }
    const style = codeStyle(el.getAttribute('style') ?? '', false);
    if (/^(div|p|li|tr|h[1-6])$/.test(tag)) {
      // Una línea: su contenido y un salto (salvo que ya acabe en uno).
      appendCode(target, el);
      if (!target.textContent?.endsWith('\n')) target.append('\n');
      continue;
    }
    if (style) {
      const span = document.createElement('span');
      span.setAttribute('style', style);
      appendCode(span, el);
      if (span.textContent) target.append(span);
      continue;
    }
    appendCode(target, el);
  }
  if (isRoot) mergeAdjacentText(target);
}

function trimTrailingNewline(code: HTMLElement): void {
  let last = code.lastChild;
  while (last && last.nodeType !== Node.TEXT_NODE && last.lastChild) last = last.lastChild;
  if (last?.nodeType === Node.TEXT_NODE && last.textContent?.endsWith('\n')) last.textContent = last.textContent.slice(0, -1);
}

function mergeAdjacentText(el: HTMLElement): void {
  el.normalize();
}

/**
 * Una tabla válida: filas dentro de <thead>/<tbody>, celdas dentro de filas y
 * todas las filas con el mismo número de columnas (se completan con celdas vacías).
 */
function normalizeTable(table: HTMLElement): void {
  // Filas sueltas (directamente en <table>) pasan a un <tbody>.
  const loose = Array.from(table.children).filter((c) => c.tagName === 'TR');
  if (loose.length) {
    const body = document.createElement('tbody');
    loose[0].before(body);
    body.append(...loose);
  }
  const rows = Array.from(table.querySelectorAll('tr'));
  if (!rows.length) {
    table.remove();
    return;
  }
  // Texto suelto en la fila: se descarta (no es una celda).
  for (const row of rows) {
    for (const child of Array.from(row.childNodes)) if (child.nodeType === Node.TEXT_NODE || !/^(TD|TH)$/.test((child as Element).tagName)) child.remove();
  }
  // Columnas ocupadas en cada fila, contando las celdas que bajan desde arriba (rowspan).
  const used: number[] = rows.map(() => 0);
  rows.forEach((row, r) => {
    for (const cell of Array.from(row.children)) {
      const cs = Number(cell.getAttribute('colspan')) || 1;
      const rs = Math.min(Number(cell.getAttribute('rowspan')) || 1, rows.length - r);
      for (let i = 0; i < rs; i++) used[r + i] += cs;
    }
  });
  const width = Math.max(...used);
  rows.forEach((row, r) => {
    const inHead = row.parentElement?.tagName === 'THEAD';
    for (let i = used[r]; i < width; i++) row.append(document.createElement(inHead ? 'th' : 'td'));
  });
  // Las celdas de cabecera de <thead> se marcan como de columna.
  for (const th of Array.from(table.querySelectorAll('thead th'))) if (!th.hasAttribute('scope')) th.setAttribute('scope', 'col');
}

/** Texto e inline sueltos al nivel superior se agrupan en párrafos. */
function wrapInlineRuns(root: HTMLElement): void {
  let run: HTMLParagraphElement | null = null;
  for (const node of Array.from(root.childNodes)) {
    const isBlock = node.nodeType === Node.ELEMENT_NODE && BLOCKS.has((node as Element).tagName.toLowerCase());
    if (isBlock) {
      run = null;
      continue;
    }
    if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim() && !run) {
      node.remove();
      continue;
    }
    if (!run) {
      run = document.createElement('p');
      root.insertBefore(run, node);
    }
    run.append(node);
  }
}

/** Bloques sin texto ni imagen (p. ej. `<p><br></p>` al final) se quitan, salvo `<hr>` y celdas. */
function removeEmptyBlocks(root: HTMLElement): void {
  for (const block of Array.from(root.querySelectorAll('p, h1, h2, h3, h4, blockquote, li, pre, strong, em, u, s, code, caption, span, figcaption'))) {
    if (block.closest('pre') && block.tagName !== 'PRE') continue;
    if (!block.textContent?.replace(/ /g, ' ').trim() && !block.querySelector('img, hr, table')) {
      // Un párrafo vacío entre otros es un salto de línea intencionado: se conserva con <br>.
      if (block.tagName === 'P' && block.previousElementSibling && block.nextElementSibling) {
        block.innerHTML = '<br>';
        continue;
      }
      block.remove();
    }
  }
  for (const list of Array.from(root.querySelectorAll('ul, ol'))) if (!list.children.length) list.remove();
  // Celdas vacías (el editor les pone <br> para poder escribir en ellas): se guardan vacías.
  for (const cell of Array.from(root.querySelectorAll('td, th'))) {
    if (!cell.textContent?.replace(/ /g, ' ').trim() && !cell.querySelector('img')) cell.innerHTML = '';
  }
}

function isEmptyContent(root: HTMLElement): boolean {
  return !root.textContent?.replace(/ /g, ' ').trim() && !root.querySelector('img, hr, table');
}

function hasAncestor(el: HTMLElement | null, tag: string): boolean {
  for (let cur = el; cur; cur = cur.parentElement) if (cur.tagName.toLowerCase() === tag) return true;
  return false;
}

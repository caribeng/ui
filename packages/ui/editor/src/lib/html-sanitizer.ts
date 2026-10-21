/**
 * Saneador y normalizador del HTML del editor.
 *
 * Deja solo una lista blanca de etiquetas y atributos (sin scripts, eventos,
 * estilos arbitrarios ni URLs peligrosas) y normaliza el resultado para que sea
 * igual en todos los navegadores: `<b>` → `<strong>`, `<i>` → `<em>`, `<div>` →
 * `<p>`, texto suelto dentro de párrafos y `''` cuando no hay contenido.
 *
 * Se aplica al cargar un valor, al pegar y al emitir el valor del editor.
 */

/** Etiquetas permitidas y sus atributos. */
const ALLOWED: Record<string, readonly string[]> = {
  p: ['style'],
  h1: ['style'],
  h2: ['style'],
  h3: ['style'],
  blockquote: ['style'],
  pre: [],
  ul: [],
  ol: ['start'],
  li: ['style'],
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
  img: ['src', 'alt', 'width', 'height', 'title'],
};

/** Equivalencias que se normalizan (mismo significado, otra etiqueta). */
const RENAME: Record<string, string> = {
  b: 'strong',
  i: 'em',
  strike: 's',
  del: 's',
  ins: 'u',
  div: 'p',
  h4: 'h3',
  h5: 'h3',
  h6: 'h3',
};

/** Etiquetas que se eliminan con todo su contenido. */
const DROP = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'noscript', 'template', 'svg', 'math',
  'form', 'input', 'button', 'select', 'textarea', 'head', 'title', 'meta', 'link', 'xml',
]);

const BLOCKS = new Set(['p', 'h1', 'h2', 'h3', 'blockquote', 'pre', 'ul', 'ol', 'hr']);
const ALIGN = new Set(['left', 'center', 'right', 'justify']);

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

export interface CbSanitizeOptions {
  /** Permite imágenes (por defecto true). */
  images?: boolean;
}

/** Devuelve el HTML saneado y normalizado; `''` si no hay texto ni imágenes. */
export function cbSanitizeHtml(html: string | null | undefined, options: CbSanitizeOptions = {}): string {
  if (!html || typeof document === 'undefined') return '';
  const images = options.images !== false;
  // <template> no ejecuta scripts ni carga imágenes al parsear.
  const template = document.createElement('template');
  template.innerHTML = cleanOffice(html);
  const out = document.createElement('div');
  for (const node of Array.from(template.content.childNodes)) appendClean(out, node, images);
  wrapInlineRuns(out);
  removeEmptyBlocks(out);
  return isEmptyContent(out) ? '' : out.innerHTML;
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
    if (node.nodeType === Node.ELEMENT_NODE && BLOCKS.has(node.nodeName.toLowerCase()) && node.nodeName !== 'UL' && node.nodeName !== 'OL') parts.push('\n');
    if (node.nodeName === 'LI') parts.push('\n');
  };
  template.content.childNodes.forEach(walk);
  return parts.join('').replace(/ /g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

/** Restos de Word / Office: comentarios condicionales, `<o:p>`, `mso-*`. */
function cleanOffice(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?o:p[^>]*>/gi, '')
    .replace(/<\/?(w|m|v):[^>]*>/gi, '');
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
  // Estilos en línea que equivalen a etiquetas (lo que pega Google Docs).
  const style = source.getAttribute('style') ?? '';
  // Google Docs envuelve todo en <b style="font-weight:normal">: no es negrita.
  if (tag === 'b' && /font-weight\s*:\s*(normal|[1-4]00)/i.test(style)) tag = 'span';
  if (tag === 'span' || tag === 'font') {
    const wrappers: string[] = [];
    if (/font-weight\s*:\s*(bold|[6-9]00)/i.test(style)) wrappers.push('strong');
    if (/font-style\s*:\s*italic/i.test(style)) wrappers.push('em');
    if (/text-decoration[^;]*underline/i.test(style)) wrappers.push('u');
    if (/text-decoration[^;]*line-through/i.test(style)) wrappers.push('s');
    let target: HTMLElement = parent;
    for (const w of wrappers) {
      const el = document.createElement(w);
      target.append(el);
      target = el;
    }
    for (const child of Array.from(source.childNodes)) appendClean(target, child, images);
    return;
  }
  tag = RENAME[tag] ?? tag;
  if (tag === 'img' && !images) return;
  if (!ALLOWED[tag]) {
    // Etiqueta no permitida: se conserva su contenido.
    for (const child of Array.from(source.childNodes)) appendClean(parent, child, images);
    return;
  }
  // Un bloque dentro de un párrafo (p. ej. <div> dentro de <p>) se aplana.
  if (tag === 'p' && parent.tagName === 'P') {
    for (const child of Array.from(source.childNodes)) appendClean(parent, child, images);
    return;
  }
  const el = document.createElement(tag);
  for (const name of ALLOWED[tag]) {
    const value = source.getAttribute(name);
    if (value === null) continue;
    if (name === 'style') {
      const align = /text-align\s*:\s*(\w+)/i.exec(value)?.[1]?.toLowerCase();
      if (align && ALIGN.has(align) && align !== 'left') el.setAttribute('style', `text-align: ${align}`);
    } else if (name === 'href') {
      if (isSafeUrl(value)) el.setAttribute('href', value.trim());
    } else if (name === 'src') {
      if (isSafeImageSrc(value)) el.setAttribute('src', value.trim());
    } else if (name === 'target') {
      if (value === '_blank') el.setAttribute('target', '_blank');
    } else if (name === 'width' || name === 'height' || name === 'start') {
      if (/^\d{1,5}$/.test(value)) el.setAttribute(name, value);
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
  if (tag === 'img' && !el.hasAttribute('src')) return;
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
  for (const child of Array.from(source.childNodes)) appendClean(el, child, images);
  parent.append(el);
}

const INLINE = new Set(['strong', 'em', 'u', 's', 'code', 'sub', 'sup']);

function hasAncestor(el: HTMLElement | null, tag: string): boolean {
  for (let cur = el; cur; cur = cur.parentElement) if (cur.tagName.toLowerCase() === tag) return true;
  return false;
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

/** Bloques sin texto ni imagen (p. ej. `<p><br></p>` al final) se quitan, salvo `<hr>`. */
function removeEmptyBlocks(root: HTMLElement): void {
  for (const block of Array.from(root.querySelectorAll('p, h1, h2, h3, blockquote, li, pre, strong, em, u, s, code'))) {
    if (!block.textContent?.replace(/ /g, ' ').trim() && !block.querySelector('img, hr')) {
      // Un párrafo vacío entre otros es un salto de línea intencionado: se conserva con <br>.
      if (block.tagName === 'P' && block.previousElementSibling && block.nextElementSibling) {
        block.innerHTML = '<br>';
        continue;
      }
      block.remove();
    }
  }
  for (const list of Array.from(root.querySelectorAll('ul, ol'))) if (!list.children.length) list.remove();
}

function isEmptyContent(root: HTMLElement): boolean {
  return !root.textContent?.replace(/ /g, ' ').trim() && !root.querySelector('img, hr');
}

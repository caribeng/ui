/*
 * Markdown ligero y seguro de CaribeNG para mensajes de chat.
 *
 * Todo el texto de entrada se escapa: el HTML que llega se muestra como texto,
 * nunca se interpreta. Solo se generan etiquetas conocidas y enlaces a
 * http(s), mailto, rutas relativas o anclas. Tolera markdown incompleto (lo
 * habitual mientras llega una respuesta en streaming): un bloque de código sin
 * cerrar se pinta igualmente como código.
 *
 * Soporta: párrafos (un salto de línea = <br>), encabezados, negrita, cursiva,
 * tachado, código en línea y en bloque (con lenguaje), enlaces, URLs sueltas,
 * listas con viñetas, numeradas y de tareas, citas, separadores y tablas.
 *
 * Solo emite etiquetas y atributos que conserva el sanitizador de Angular
 * (`[innerHTML]`): nada de `style` ni `<input>`.
 */

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** URL permitida en un enlace, o `null`. */
export function cbSafeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed;
  if (/^[a-z][a-z\d+.-]*:/i.test(trimmed)) return null;
  // Relativas, anclas y consultas; nunca "//dominio" (abriría otro origen sin esquema explícito).
  if (/^(\/(?!\/)|#|\?|\.{1,2}\/)/.test(trimmed) || /^[\w-][\w./-]*$/.test(trimmed)) return trimmed;
  return null;
}

function link(href: string, label: string): string {
  const external = /^(https?:)?\/\//i.test(href);
  const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a href="${escapeHtml(href)}"${attrs}>${label}</a>`;
}

/** Formato en línea sobre texto aún sin escapar. */
function inline(text: string): string {
  const tokens: string[] = [];
  const stash = (html: string) => `\u0000${tokens.push(html) - 1}\u0000`;

  // 1) Código en línea: su contenido no se formatea.
  let out = text.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (_m, _ticks, code: string) => stash(`<code>${escapeHtml(code.trim() === '' ? code : code.replace(/^ (.*) $/, '$1'))}</code>`));
  // 2) Enlaces [texto](url).
  out = out.replace(/\[([^\]\n]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (m, label: string, url: string) => {
    const safe = cbSafeUrl(url);
    return safe ? stash(link(safe, formatEmphasis(escapeHtml(label)))) : m;
  });
  // 3) URLs sueltas.
  out = out.replace(/\bhttps?:\/\/[^\s<>()]+[^\s<>().,;:!?'"\]]/g, (url) => stash(link(url, escapeHtml(url))));
  // 4) Resto: escapar y aplicar énfasis.
  out = formatEmphasis(escapeHtml(out));
  // Los tokens pueden contener otros (código dentro del texto de un enlace).
  for (let depth = 0; depth < 4 && out.includes('\u0000'); depth++) {
    out = out.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => tokens[Number(i)]);
  }
  return out;
}

/** Negrita, cursiva y tachado sobre texto ya escapado. */
function formatEmphasis(html: string): string {
  return html
    .replace(/\*\*\*(?=\S)([\s\S]*?\S)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w])__(?=\S)([\s\S]*?\S)__(?!\w)/g, '$1<strong>$2</strong>')
    .replace(/(^|[^*\w])\*([^\s*](?:[^*\n]*?[^\s*])?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/(^|[^\w])_([^\s_](?:[^_\n]*?[^\s_])?)_(?!\w)/g, '$1<em>$2</em>')
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>');
}

const FENCE = /^ {0,3}(`{3,}|~{3,})\s*([\w#+.-]*)\s*$/;
const HEADING = /^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
const HR = /^ {0,3}([-*_])(\s*\1){2,}\s*$/;
const QUOTE = /^ {0,3}>\s?/;
const BULLET = /^(\s*)([-*+])\s+(.*)$/;
const ORDERED = /^(\s*)(\d{1,9})[.)]\s+(.*)$/;
const TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

function splitRow(line: string): string[] {
  let row = line.trim();
  if (row.startsWith('|')) row = row.slice(1);
  if (row.endsWith('|') && !row.endsWith('\\|')) row = row.slice(0, -1);
  return row.split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, '|'));
}

function isBlockStart(line: string): boolean {
  return FENCE.test(line) || HEADING.test(line) || HR.test(line) || QUOTE.test(line) || BULLET.test(line) || ORDERED.test(line);
}

function renderList(lines: string[], start: number): { html: string; next: number } {
  const ordered = ORDERED.test(lines[start]);
  const pattern = ordered ? ORDERED : BULLET;
  const first = lines[start].match(pattern)!;
  const indent = first[1].length;
  const items: string[] = [];
  let i = start;
  while (i < lines.length) {
    const m = lines[i].match(pattern);
    if (!m || m[1].length !== indent) break;
    let body = m[3];
    i++;
    // Líneas de continuación y sublistas más indentadas.
    const nested: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !(lines[i].match(pattern)?.[1].length === indent) && (/^\s+/.test(lines[i]) || !isBlockStart(lines[i]))) {
      nested.push(lines[i]);
      i++;
    }
    let sub = '';
    const subStart = nested.findIndex((l) => BULLET.test(l) || ORDERED.test(l));
    if (subStart >= 0) {
      body += nested.slice(0, subStart).map((l) => '\n' + l.trim()).join('');
      sub = renderBlocks(nested.slice(subStart).map((l) => l.replace(new RegExp(`^\\s{0,${indent + 4}}`), '')));
    } else {
      body += nested.map((l) => '\n' + l.trim()).join('');
    }
    const task = !ordered ? body.match(/^\[([ xX])\]\s+(.*)$/s) : null;
    const content = task
      ? `<span class="cb-md-check">${task[1].trim() ? '☑' : '☐'}</span> ${inline(task[2]).replace(/\n/g, '<br>')}`
      : inline(body).replace(/\n/g, '<br>');
    items.push(`<li${task ? ' class="cb-md-task"' : ''}>${content}${sub}</li>`);
    if (i < lines.length && lines[i].trim() === '' && lines[i + 1]?.match(pattern)?.[1].length === indent) i++;
  }
  const startAttr = ordered && first[2] !== '1' ? ` start="${Number(first[2])}"` : '';
  return { html: ordered ? `<ol${startAttr}>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`, next: i };
}

function renderBlocks(lines: string[]): string {
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      i++;
      continue;
    }

    const fence = line.match(FENCE);
    if (fence) {
      const marker = fence[1];
      const lang = fence[2];
      const code: string[] = [];
      i++;
      while (i < lines.length && !new RegExp(`^ {0,3}${marker[0]}{${marker.length},}\\s*$`).test(lines[i])) code.push(lines[i++]);
      i++; // cierre (o fin del texto si llega incompleto)
      const cls = lang ? ` class="language-${escapeHtml(lang)}"` : '';
      const label = lang ? `<span class="cb-md-lang">${escapeHtml(lang)}</span>` : '';
      out.push(`<pre>${label}<code${cls}>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      i++;
      continue;
    }

    if (HR.test(line)) {
      out.push('<hr />');
      i++;
      continue;
    }

    if (QUOTE.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && (QUOTE.test(lines[i]) || (lines[i].trim() !== '' && !isBlockStart(lines[i]) && quoted.length))) {
        quoted.push(lines[i].replace(QUOTE, ''));
        i++;
      }
      out.push(`<blockquote>${renderBlocks(quoted)}</blockquote>`);
      continue;
    }

    if (BULLET.test(line) || ORDERED.test(line)) {
      const list = renderList(lines, i);
      out.push(list.html);
      i = list.next;
      continue;
    }

    if (line.includes('|') && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const header = splitRow(line);
      const aligns = splitRow(lines[i + 1]).map((c) => (c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : c.startsWith(':') ? 'left' : ''));
      // Alineación con clases: el sanitizador de Angular elimina los atributos style.
      const cell = (tag: string, text: string, col: number) => `<${tag}${aligns[col] ? ` class="cb-md-${aligns[col]}"` : ''}>${inline(text)}</${tag}>`;
      const rows: string[] = [];
      i += 2;
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        const cells = splitRow(lines[i]);
        rows.push(`<tr>${header.map((_h, c) => cell('td', cells[c] ?? '', c)).join('')}</tr>`);
        i++;
      }
      out.push(
        `<div class="cb-md-table"><table><thead><tr>${header.map((h, c) => cell('th', h, c)).join('')}</tr></thead>` +
          `<tbody>${rows.join('')}</tbody></table></div>`,
      );
      continue;
    }

    // Párrafo: hasta una línea vacía o el inicio de otro bloque.
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && (para.length === 0 || !isBlockStart(lines[i]))) para.push(lines[i++].trim());
    out.push(`<p>${inline(para.join('\n')).replace(/\n/g, '<br>')}</p>`);
  }
  return out.join('');
}

/** Convierte markdown en HTML seguro (todo el HTML de entrada se escapa). */
export function cbMarkdownToHtml(markdown: string): string {
  return renderBlocks((markdown ?? '').replace(/\r\n?/g, '\n').split('\n'));
}

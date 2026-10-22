import { parsePrimeIcon } from './icons';
import { TODO_MARK } from './todo';
import { DIRECTIVES_BY_ATTR, ELEMENTS_BY_ATTR, ELEMENTS_BY_TAG } from './mappings';
import { renderAttr } from './mappings/rules';
import type { Binding, ChildElement, DirectiveMapping, ElementMapping, ElementRewrite } from './mappings/types';

/** `@angular/compiler` (ESM): se carga con `import()` desde los schematics (CommonJS). */
export type Compiler = typeof import('@angular/compiler');
type HtmlNode = import('@angular/compiler').Node;
type HtmlElement = import('@angular/compiler').Element;
type HtmlAttribute = import('@angular/compiler').Attribute;

export function loadCompiler(): Promise<Compiler> {
  return import('@angular/compiler');
}

export { TODO_MARK };

export interface TemplateResult {
  readonly text: string;
  readonly changed: boolean;
  /** Iconos de CaribeNG que usa la plantilla migrada. */
  readonly icons: ReadonlySet<string>;
  /** Error de sintaxis de la plantilla (no se toca). */
  readonly error?: string;
}

interface Edit {
  readonly start: number;
  readonly end: number;
  readonly text: string;
}

/** Traduce los selectores PrimeNG de una plantilla Angular a CaribeNG. */
export function rewriteTemplate(compiler: Compiler, text: string, url: string): TemplateResult {
  const parsed = new compiler.HtmlParser().parse(text, url, {
    tokenizeExpansionForms: true,
    tokenizeBlocks: true,
    tokenizeLet: true,
  });
  if (parsed.errors.length) {
    return { text, changed: false, icons: new Set(), error: parsed.errors.map((e) => e.toString()).join('\n') };
  }

  const edits: Edit[] = [];
  const icons = new Set<string>();

  const visit = (nodes: readonly HtmlNode[]): void => {
    for (const node of nodes) {
      if (node instanceof compiler.Element) {
        visitElement(node);
        visit(node.children);
      } else if (node instanceof compiler.Block) {
        visit(node.children);
      } else if (node instanceof compiler.Expansion) {
        for (const expansionCase of node.cases) visit(expansionCase.expression);
      }
    }
  };

  const visitElement = (element: HtmlElement): void => {
    const directives = element.attrs
      .map((attr) => DIRECTIVES_BY_ATTR.get(attr.name.replace(/^\[(.+)\]$/, '$1')))
      .filter((directive): directive is DirectiveMapping => directive !== undefined);
    const mapping = ELEMENTS_BY_TAG.get(element.name) ?? element.attrs.map((attr) => ELEMENTS_BY_ATTR.get(attr.name)).find(Boolean);
    if (mapping?.attr && mapping.on && !mapping.on.includes(element.name)) {
      const hint = mapping.otherTags ?? `usa un <${mapping.to}> o el componente CaribeNG equivalente.`;
      edits.push(todoEdit(text, element.sourceSpan.start.offset, `${mapping.attr} en <${element.name}> no se migra automáticamente: ${hint}`));
      return;
    }
    if (mapping || directives.length) {
      rewriteElement(text, element, mapping ?? null, directives, edits, icons);
      if (mapping) rewriteChildren(compiler, text, element, mapping, edits);
      return;
    }
    rewriteIcon(compiler, text, element, edits, icons);
  };

  visit(parsed.rootNodes);
  if (!edits.length) return { text, changed: false, icons };
  return { text: applyEdits(text, edits), changed: true, icons };
}

/** Aplica ediciones (sin solapes) de atrás hacia delante. */
export function applyEdits(text: string, edits: readonly { start: number; end: number; text: string }[]): string {
  const sorted = [...edits].sort((a, b) => b.start - a.start || b.end - a.end);
  let result = text;
  let limit = Number.POSITIVE_INFINITY;
  for (const edit of sorted) {
    if (edit.end > limit) throw new Error(`Ediciones solapadas en ${edit.start}-${edit.end}`);
    result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
    limit = edit.start;
  }
  return result;
}

/** Clasifica un atributo de plantilla. `null` para referencias, directivas estructurales, `[attr.x]`… */
export function classify(text: string, attr: HtmlAttribute): Binding | null {
  const source = text.slice(attr.sourceSpan.start.offset, attr.sourceSpan.end.offset);
  const value = attr.value;
  const bare = attr.valueSpan === undefined;
  const name = attr.name;
  let match: RegExpExecArray | null;
  if ((match = /^\[\((.+)\)\]$/.exec(name)) || (match = /^bindon-(.+)$/.exec(name))) return { kind: 'twoWay', name: match[1], value, bare, source };
  if ((match = /^\[(.+)\]$/.exec(name)) || (match = /^bind-(.+)$/.exec(name))) {
    return /^(attr|class|style)\./.test(match[1]) ? null : { kind: 'property', name: match[1], value, bare, source };
  }
  if ((match = /^\((.+)\)$/.exec(name)) || (match = /^on-(.+)$/.exec(name))) return { kind: 'event', name: match[1], value, bare, source };
  if (/^(#|\*|@|let-|ref-|i18n)/.test(name)) return null;
  return { kind: 'static', name, value, bare, source };
}

/**
 * Reescribe un elemento: con `mapping` cambia el tag (`p-button` →
 * `cb-button`); sin él solo traduce los atributos de sus directivas
 * (`pTooltip` → `cbTooltip`) y conserva el tag y su contenido.
 */
function rewriteElement(
  text: string,
  element: HtmlElement,
  mapping: ElementMapping | null,
  directives: readonly DirectiveMapping[],
  edits: Edit[],
  icons: Set<string>,
): void {
  const tag = mapping?.to ?? element.name;
  const bindings: Binding[] = [];
  const attrs: string[] = [];
  const order: (Binding | string)[] = [];
  for (const attr of element.attrs) {
    const binding = classify(text, attr);
    if (binding) bindings.push(binding);
    order.push(binding ?? text.slice(attr.sourceSpan.start.offset, attr.sourceSpan.end.offset));
  }

  const el: ElementRewrite = {
    tag,
    attrs,
    before: [],
    after: [],
    todos: [],
    icons: new Set(),
    bindings,
    find: (name) => bindings.find((b) => b.name === name && b.kind !== 'event') ?? bindings.find((b) => b.kind === 'event' && `(${b.name})` === name),
  };

  for (const item of order) {
    if (typeof item === 'string') {
      attrs.push(item);
      continue;
    }
    // La propia directiva PrimeNG del componente (`pButton`) desaparece.
    if (mapping?.attr && item.kind === 'static' && item.name === mapping.attr) continue;
    // La de una directiva (`pTooltip`) pasa a la de CaribeNG (`cbTooltip`).
    const directive = directives.find((d) => d.attr === item.name && item.kind !== 'event');
    if (directive) {
      attrs.push(renderAttr(item.kind, directive.to, item.value, item.bare));
      continue;
    }
    const key = item.kind === 'event' ? `(${item.name})` : item.name;
    const rule = directives.find((d) => d.rules[key])?.rules[key] ?? mapping?.rules[key];
    if (rule) rule(item, el);
    else attrs.push(item.source);
  }
  mapping?.finalize?.(el);
  mergeClasses(attrs);
  el.icons.forEach((icon) => icons.add(icon));

  const start = element.sourceSpan.start.offset;
  const startTag = text.slice(start, element.startSourceSpan.end.offset);
  // Atributos en varias líneas: se conserva la sangría de la primera línea de atributos.
  const separator = /\r?\n[ \t]*(?=[^\s/>])/.exec(startTag)?.[0] ?? ' ';
  // `/>` o `>` en su propia línea se conserva; un simple espacio antes de `/>` no.
  const closingSpace = /(\s*)\/?>$/.exec(startTag)?.[1].match(/\r?\n[ \t]*$/)?.[0] ?? '';
  const head = `<${tag}${attrs.map((attr) => separator + attr).join('')}`;
  const todos = el.todos.map((todo) => todoPrefix(text, start, todo)).join('');
  const content = [...el.before, ...el.after];

  if (!mapping) {
    // Solo directivas: el elemento, su cierre y su contenido no cambian.
    const close = startTag.endsWith('/>') ? `${closingSpace || ' '}/>` : `${closingSpace}>`;
    edits.push({ start, end: element.startSourceSpan.end.offset, text: `${todos}${head}${close}` });
    return;
  }

  const hasEndTag = !element.isSelfClosing && !element.isVoid && element.endSourceSpan && element.endSourceSpan.start.offset !== element.startSourceSpan.start.offset;
  if (mapping.selfClosing) {
    edits.push({ start, end: element.sourceSpan.end.offset, text: `${todos}${head}${closingSpace || ' '}/>` });
  } else if (!hasEndTag) {
    const body = content.length ? `${closingSpace}>${content.join('')}</${mapping.to}>` : `${closingSpace || ' '}/>`;
    edits.push({ start, end: element.sourceSpan.end.offset, text: `${todos}${head}${body}` });
  } else {
    edits.push({ start, end: element.startSourceSpan.end.offset, text: `${todos}${head}${closingSpace}>${el.before.join('')}` });
    edits.push({ start: element.endSourceSpan!.start.offset, end: element.endSourceSpan!.end.offset, text: `${el.after.join('')}</${mapping.to}>` });
  }
}

/** Hijos directos con reescritura propia (p. ej. `<ng-template #footer>` de un diálogo). */
function rewriteChildren(compiler: Compiler, text: string, element: HtmlElement, mapping: ElementMapping, edits: Edit[]): void {
  if (!mapping.child) return;
  for (const node of element.children) {
    if (!(node instanceof compiler.Element)) continue;
    const child: ChildElement = {
      name: node.name,
      bindings: node.attrs.map((attr) => classify(text, attr)).filter((b): b is Binding => b !== null),
      references: node.attrs.filter((attr) => /^(#|ref-)/.test(attr.name)).map((attr) => attr.name.replace(/^(#|ref-)/, '')),
    };
    const rewrite = mapping.child(child);
    if (!rewrite) continue;
    if ('todo' in rewrite) {
      edits.push(todoEdit(text, node.sourceSpan.start.offset, rewrite.todo));
      continue;
    }
    const head = `<${rewrite.tag}${rewrite.attrs.map((attr) => ` ${attr}`).join('')}`;
    if (node.endSourceSpan && !node.isSelfClosing) {
      edits.push({ start: node.startSourceSpan.start.offset, end: node.startSourceSpan.end.offset, text: `${head}>` });
      edits.push({ start: node.endSourceSpan.start.offset, end: node.endSourceSpan.end.offset, text: `</${rewrite.tag}>` });
    } else {
      edits.push({ start: node.sourceSpan.start.offset, end: node.sourceSpan.end.offset, text: `${head}></${rewrite.tag}>` });
    }
  }
}

/** `<i class="pi pi-check"></i>` → `<cb-icon name="check" />`. */
function rewriteIcon(compiler: Compiler, text: string, element: HtmlElement, edits: Edit[], icons: Set<string>): void {
  if (!['i', 'span', 'em'].includes(element.name)) return;
  const classAttr = element.attrs.find((attr) => attr.name === 'class');
  const parsed = classAttr && parsePrimeIcon(classAttr.value);
  if (!parsed) return;
  const start = element.sourceSpan.start.offset;
  const empty = element.children.every((child) => child instanceof compiler.Text && !child.value.trim());
  if (!parsed.name || !empty) {
    const why = parsed.name ? 'el elemento tiene contenido' : `pi-${parsed.prime} no tiene equivalente conocido`;
    edits.push(todoEdit(text, start, `icono de PrimeIcons sin migrar (${why}): usa <cb-icon name="…" />.`));
    return;
  }
  icons.add(parsed.name);
  const attrs = [`name="${parsed.name}"`];
  if (parsed.spin) attrs.push('spin');
  if (parsed.rest.length) attrs.push(`class="${parsed.rest.join(' ')}"`);
  for (const attr of element.attrs) {
    if (attr !== classAttr) attrs.push(text.slice(attr.sourceSpan.start.offset, attr.sourceSpan.end.offset));
  }
  edits.push({ start, end: element.sourceSpan.end.offset, text: `<cb-icon ${attrs.join(' ')} />` });
}

/** Une varios `class="…"` estáticos en uno (p. ej. `class` + `styleClass`). */
function mergeClasses(attrs: string[]): void {
  const indexes = attrs.map((attr, i) => (/^class=(["'])/.test(attr) ? i : -1)).filter((i) => i >= 0);
  if (indexes.length < 2) return;
  const merged = indexes.map((i) => attrs[i].slice(7, -1)).join(' ');
  for (const i of indexes.slice(1).reverse()) attrs.splice(i, 1);
  attrs[indexes[0]] = renderAttr('static', 'class', merged);
}

/**
 * Aviso para colocar justo antes de un elemento: en su propia línea y con la
 * misma sangría si el elemento empieza la línea; si no, en la misma línea.
 */
function todoPrefix(text: string, offset: number, message: string): string {
  const indent = lineIndent(text, offset);
  const comment = `<!-- ${TODO_MARK}: ${message.replace(/--+/g, '-').replace(/\s+/g, ' ')} -->`;
  const newline = text.includes('\r\n') ? '\r\n' : '\n';
  return comment + (indent === null ? ' ' : newline + indent);
}

function todoEdit(text: string, offset: number, message: string): Edit {
  return { start: offset, end: offset, text: todoPrefix(text, offset, message) };
}

/** Sangría de la línea si el elemento es lo primero de ella; `null` si va detrás de otro contenido. */
function lineIndent(text: string, offset: number): string | null {
  const prefix = text.slice(text.lastIndexOf('\n', offset - 1) + 1, offset);
  return /^[ \t]*$/.test(prefix) ? prefix : null;
}

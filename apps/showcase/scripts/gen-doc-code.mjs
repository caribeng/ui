#!/usr/bin/env node
/**
 * Genera el código TypeScript (componente standalone completo) de cada ejemplo
 * del showcase a partir del propio código fuente de las páginas.
 *
 * Por cada `<doc-section [code]="...">` y `<cb-doc-example code="...">`:
 *  - detecta los componentes/directivas/pipes usados en el HTML → `imports`,
 *  - detecta las propiedades/métodos de la página que usa el template (y sus
 *    dependencias transitivas) → cuerpo de la clase con los datos reales,
 *  - arrastra los `import` y los tipos/constantes top-level que necesite.
 *
 * Salida: apps/showcase/public/doc-code.json  ({ [hash(html)]: typescript })
 * Uso:    node apps/showcase/scripts/gen-doc-code.mjs
 */
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const PAGES_DIR = join(ROOT, 'apps/showcase/src/app/pages');
const UI_DIR = join(ROOT, 'packages/ui');
const OUT_FILE = join(ROOT, 'apps/showcase/public/doc-code.json');

/** Hash estable del HTML (debe coincidir con `docCodeKey` en doc-code.service.ts). */
export function docCodeKey(html) {
  const s = html.trim();
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(36) + (h1 >>> 0).toString(36);
}

// ───────────────────────── Utilidades ─────────────────────────

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name !== 'node_modules') walk(full, out);
    } else if (name.endsWith('.ts') && !name.endsWith('.spec.ts')) {
      out.push(full);
    }
  }
  return out;
}

function parse(file) {
  return ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
}

function decoratorArgs(node, name) {
  for (const d of ts.getDecorators?.(node) ?? []) {
    const call = d.expression;
    if (ts.isCallExpression(call) && ts.isIdentifier(call.expression) && call.expression.text === name) {
      const arg = call.arguments[0];
      return arg && ts.isObjectLiteralExpression(arg) ? arg : null;
    }
  }
  return null;
}

function prop(obj, name) {
  const p = obj?.properties.find(
    (x) => ts.isPropertyAssignment(x) && x.name && x.name.getText() === name,
  );
  return p ? p.initializer : null;
}

function stringValue(node) {
  if (!node) return null;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return null;
}

const ENTITIES = { '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&amp;': '&' };
const decode = (s) => s.replace(/&(lt|gt|quot|#39|apos|amp);/g, (m) => ENTITIES[m]);

const IDENT = /[A-Za-z_$][\w$]*/g;
const stripStrings = (s) => s.replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g, "''");

function identifiers(text) {
  const out = new Set();
  const clean = stripStrings(text);
  for (const m of clean.matchAll(IDENT)) {
    const prev = clean[m.index - 1];
    if (prev === '.' && clean[m.index - 2] !== '.') continue; // acceso a propiedad
    out.add(m[0]);
  }
  return out;
}

const pascal = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');

const kebab = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join('-');

function dedent(text) {
  const lines = text.replace(/^\n+|\s+$/g, '').split('\n');
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min));
}

const indent = (text, pad) =>
  dedent(text)
    .map((l) => (l.trim() ? pad + l : ''))
    .join('\n');

/** Texto del nodo conservando su sangría original (para poder re-indentarlo). */
function nodeText(node) {
  const sf = node.getSourceFile();
  const start = node.getStart();
  const lineStart = sf.text.lastIndexOf('\n', start - 1) + 1;
  const prefix = sf.text.slice(lineStart, start);
  return (/^\s*$/.test(prefix) ? prefix : '') + sf.text.slice(start, node.getEnd());
}

// ───────────────────────── Registro de la librería ─────────────────────────

/** alias de tsconfig (`@caribeng/ui/select`) por carpeta del entry point. */
function entryPoints() {
  const paths = JSON.parse(readFileSync(join(ROOT, 'tsconfig.base.json'), 'utf8')).compilerOptions.paths;
  return Object.entries(paths)
    .map(([alias, [p]]) => ({ alias, dir: resolve(ROOT, dirname(dirname(p))) + sep }))
    .filter((e) => e.alias.startsWith('@caribeng/ui/'))
    .sort((a, b) => b.dir.length - a.dir.length);
}

/** Selector CSS simple → { tag, attrs[] } (soporta `a`, `[b]`, `a[b]`, `a[b=c]`, listas con coma). */
function parseSelectors(sel) {
  return sel
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && !s.includes(':not'))
    .map((s) => {
      const tag = s.match(/^[a-zA-Z][\w-]*/)?.[0] ?? null;
      const attrs = [...s.matchAll(/\[([^\]=]+)(?:=[^\]]*)?\]/g)].map((m) => m[1].toLowerCase());
      return { tag: tag?.toLowerCase() ?? null, attrs };
    });
}

function buildRegistry() {
  const eps = entryPoints();
  const selectors = [];
  const pipes = new Map();
  for (const file of walk(UI_DIR)) {
    if (!file.includes(`${sep}src${sep}`)) continue;
    const ep = eps.find((e) => file.startsWith(e.dir));
    if (!ep) continue;
    const sf = parse(file);
    for (const st of sf.statements) {
      if (!ts.isClassDeclaration(st) || !st.name) continue;
      if (!st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
      const cls = st.name.text;
      const meta = decoratorArgs(st, 'Component') ?? decoratorArgs(st, 'Directive');
      const sel = stringValue(prop(meta, 'selector'));
      if (sel) {
        for (const s of parseSelectors(sel)) selectors.push({ ...s, cls, module: ep.alias });
      }
      const pipeName = stringValue(prop(decoratorArgs(st, 'Pipe'), 'name'));
      if (pipeName) pipes.set(pipeName, { cls, module: ep.alias });
    }
  }
  return { selectors, pipes };
}

const ANGULAR_ATTRS = [
  { attrs: ['ngmodel'], cls: 'FormsModule', module: '@angular/forms' },
  { attrs: ['formcontrol'], cls: 'ReactiveFormsModule', module: '@angular/forms' },
  { attrs: ['formcontrolname'], cls: 'ReactiveFormsModule', module: '@angular/forms' },
  { attrs: ['formgroup'], cls: 'ReactiveFormsModule', module: '@angular/forms' },
  { attrs: ['formarrayname'], cls: 'ReactiveFormsModule', module: '@angular/forms' },
  { attrs: ['formgroupname'], cls: 'ReactiveFormsModule', module: '@angular/forms' },
  { attrs: ['routerlink'], cls: 'RouterLink', module: '@angular/router' },
  { attrs: ['routerlinkactive'], cls: 'RouterLinkActive', module: '@angular/router' },
  { attrs: ['ngclass'], cls: 'NgClass', module: '@angular/common' },
  { attrs: ['ngstyle'], cls: 'NgStyle', module: '@angular/common' },
  { attrs: ['ngtemplateoutlet'], cls: 'NgTemplateOutlet', module: '@angular/common' },
].map((x) => ({ tag: null, ...x }));

const ANGULAR_PIPES = {
  date: 'DatePipe',
  currency: 'CurrencyPipe',
  number: 'DecimalPipe',
  percent: 'PercentPipe',
  json: 'JsonPipe',
  async: 'AsyncPipe',
  uppercase: 'UpperCasePipe',
  lowercase: 'LowerCasePipe',
  titlecase: 'TitleCasePipe',
  slice: 'SlicePipe',
  keyvalue: 'KeyValuePipe',
};

// ───────────────────────── Análisis del HTML ─────────────────────────

/** Tokeniza un tag de apertura respetando comillas: devuelve { tag, attrs: [{name, value}] , end }. */
function readTag(src, from) {
  const m = /^<([a-zA-Z][\w-]*)/.exec(src.slice(from));
  if (!m) return null;
  let i = from + m[0].length;
  const attrs = [];
  while (i < src.length) {
    while (/\s/.test(src[i])) i++;
    if (src[i] === '>' || src.startsWith('/>', i)) {
      return { tag: m[1].toLowerCase(), attrs, end: i + (src[i] === '>' ? 1 : 2) };
    }
    const n = /^[^\s=/>]+/.exec(src.slice(i));
    if (!n) {
      i++;
      continue;
    }
    i += n[0].length;
    let value = null;
    while (/\s/.test(src[i])) i++;
    if (src[i] === '=') {
      i++;
      while (/\s/.test(src[i])) i++;
      const q = src[i];
      if (q === '"' || q === "'") {
        const close = src.indexOf(q, i + 1);
        value = src.slice(i + 1, close);
        i = close + 1;
      } else {
        const v = /^[^\s>]+/.exec(src.slice(i));
        value = v ? v[0] : '';
        i += value.length;
      }
    }
    attrs.push({ name: n[0], value });
  }
  return null;
}

function* tags(src) {
  for (let i = src.indexOf('<'); i !== -1; i = src.indexOf('<', i + 1)) {
    const t = readTag(src, i);
    if (t) yield t;
  }
}

const attrKey = (name) => name.replace(/^\[\(|^\[|^\(|^\*|^bind-|^on-|\)\]$|\]$|\)$/g, '').split('.')[0].toLowerCase();

/** Expresiones Angular del template (bindings, eventos, interpolaciones, control flow). */
function templateExpressions(html) {
  const exprs = [];
  for (const t of tags(html)) {
    for (const a of t.attrs) {
      if (a.value != null && /^(\[|\(|\*|bind-|on-)/.test(a.name)) exprs.push(decode(a.value));
    }
  }
  for (const m of html.matchAll(/\{\{([\s\S]*?)\}\}/g)) exprs.push(m[1]);
  for (const m of html.matchAll(/@(?:if|for|switch|case|defer)\s*\(([^)]*(?:\([^)]*\)[^)]*)*)\)/g)) exprs.push(m[1]);
  for (const m of html.matchAll(/@let\s+\w+\s*=\s*([^;]+);/g)) exprs.push(m[1]);
  return exprs;
}

const GLOBALS = new Set(['$any', 'Math', 'Number', 'String', 'Boolean', 'Array', 'Object', 'JSON', 'Date']);

/** Variables locales del template: `#ref`, `let-x`, `@for (x of …; let i = $index)`, `@let x`, `as x`. */
function templateLocals(html) {
  const out = new Set();
  for (const m of html.matchAll(/#([A-Za-z_][\w$]*)/g)) out.add(m[1]);
  for (const m of html.matchAll(/\blet-([A-Za-z_][\w$]*)/g)) out.add(m[1]);
  for (const m of html.matchAll(/@for\s*\(\s*([A-Za-z_][\w$]*)\s+of/g)) out.add(m[1]);
  for (const m of html.matchAll(/\blet\s+([A-Za-z_][\w$]*)\s*=/g)) out.add(m[1]);
  for (const m of html.matchAll(/@let\s+([A-Za-z_][\w$]*)/g)) out.add(m[1]);
  for (const m of html.matchAll(/;\s*as\s+([A-Za-z_][\w$]*)/g)) out.add(m[1]);
  return out;
}

function usedDeclarables(html, registry) {
  const found = new Map();
  const add = (cls, module) => found.set(cls, module);
  for (const t of tags(html)) {
    const keys = new Set(t.attrs.map((a) => attrKey(a.name)));
    for (const s of [...registry.selectors, ...ANGULAR_ATTRS]) {
      if (s.tag && s.tag !== t.tag) continue;
      if (!s.tag && !s.attrs.length) continue;
      if (s.attrs.every((a) => keys.has(a))) add(s.cls, s.module);
    }
  }
  for (const expr of templateExpressions(html)) {
    for (const m of stripStrings(expr).matchAll(/\|\s*([A-Za-z_]\w*)/g)) {
      const name = m[1];
      if (ANGULAR_PIPES[name]) add(ANGULAR_PIPES[name], '@angular/common');
      else if (registry.pipes.has(name)) add(registry.pipes.get(name).cls, registry.pipes.get(name).module);
    }
  }
  return found;
}

// ───────────────────────── Análisis de la página ─────────────────────────

function analyzePage(file) {
  const sf = parse(file);
  const imports = new Map(); // nombre local → { module, text }
  const topLevel = new Map(); // nombre → nodo (interfaces, types, const, function, enum)
  let cls = null;
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st)) {
      const module = st.moduleSpecifier.text;
      const clause = st.importClause;
      const typeOnly = !!clause?.isTypeOnly;
      if (clause?.name) imports.set(clause.name.text, { module, name: 'default', typeOnly });
      const nb = clause?.namedBindings;
      if (nb && ts.isNamedImports(nb)) {
        for (const el of nb.elements) {
          imports.set(el.name.text, {
            module,
            name: el.propertyName?.text ?? el.name.text,
            typeOnly: typeOnly || el.isTypeOnly,
          });
        }
      }
    } else if (ts.isClassDeclaration(st) && decoratorArgs(st, 'Component')) {
      cls ??= st;
    } else if (
      ts.isInterfaceDeclaration(st) ||
      ts.isTypeAliasDeclaration(st) ||
      ts.isEnumDeclaration(st) ||
      ts.isFunctionDeclaration(st) ||
      ts.isClassDeclaration(st)
    ) {
      if (st.name) topLevel.set(st.name.text, st);
    } else if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (ts.isIdentifier(d.name)) topLevel.set(d.name.text, st);
      }
    }
  }
  if (!cls) return null;

  const members = new Map();
  for (const m of cls.members) {
    if (m.name && (ts.isPropertyDeclaration(m) || ts.isMethodDeclaration(m) || ts.isGetAccessor(m) || ts.isSetAccessor(m))) {
      const name = m.name.getText();
      if (!members.has(name)) members.set(name, []);
      members.get(name).push(m);
    }
  }

  const template = stringValue(prop(decoratorArgs(cls, 'Component'), 'template')) ?? '';
  return { file, sf, cls, imports, topLevel, members, template };
}

/** Ejemplos (`doc-section` / `cb-doc-example`) con su HTML resuelto. */
function examples(page) {
  const out = [];
  for (const t of tags(page.template)) {
    if (t.tag !== 'doc-section' && t.tag !== 'cb-doc-example') continue;
    const get = (n) => t.attrs.find((a) => a.name === n)?.value ?? null;
    let html = get('code') != null ? decode(get('code')) : null;
    const bound = get('[code]');
    if (bound && /^\w+$/.test(bound)) {
      const decl = page.members.get(bound)?.[0];
      html = decl && ts.isPropertyDeclaration(decl) ? stringValue(decl.initializer) : null;
    }
    const tsBound = get('[codeTs]');
    const manualTs = tsBound && /^\w+$/.test(tsBound)
      ? stringValue(page.members.get(tsBound)?.[0]?.initializer)
      : get('codeTs');
    // Algunos `doc-section` muestran código TS/bash en lugar de HTML: no se envuelven.
    const isHtml = html && /^\s*(<|@(if|for|switch|let|defer)\b|\{\{)/.test(html);
    if (isHtml) out.push({ id: get('id') ?? get('title') ?? '', title: get('title') ?? '', html, manualTs });
  }
  return out;
}

// Miembros que son infraestructura del showcase, nunca parte de un ejemplo.
const INFRA_MEMBERS = new Set(['docApi', 'playground', 'i18n', 'toc']);

function generate(page, ex, registry, pageName) {
  // 1) Miembros referenciados por el template (+ cierre transitivo vía `this.x`).
  const wanted = new Set();
  const queue = [];
  const consider = (name) => {
    if (INFRA_MEMBERS.has(name) || wanted.has(name) || !page.members.has(name)) return;
    wanted.add(name);
    queue.push(name);
  };
  for (const expr of templateExpressions(ex.html)) for (const id of identifiers(expr)) consider(id);
  // Referencias a template-refs (`#menu`) usadas como `viewChild('menu')` también cuentan.
  const extraText = [];
  while (queue.length) {
    const name = queue.shift();
    for (const decl of page.members.get(name)) {
      const text = decl.getText();
      extraText.push(text);
      for (const m of text.matchAll(/this\.([A-Za-z_$][\w$]*)/g)) consider(m[1]);
    }
  }
  // viewChild/ViewChild cuyos refs aparecen en el HTML.
  for (const [name, decls] of page.members) {
    if (wanted.has(name) || INFRA_MEMBERS.has(name)) continue;
    const text = decls[0].getText();
    const ref = text.match(/(?:viewChild|ViewChild)(?:\.required)?(?:<[^>]*>)?\(\s*'([\w-]+)'/)?.[1];
    if (ref && new RegExp(`#${ref}\\b`).test(ex.html)) {
      wanted.add(name);
      extraText.push(text);
    }
  }

  const memberNodes = page.cls.members.filter((m) => m.name && wanted.has(m.name.getText()));
  const memberBlocks = memberNodes.map((m) => indent(nodeText(m), '  '));

  // Handlers del snippet que la página no implementa (`(click)="guardar()"`) → stub.
  const locals = templateLocals(ex.html);
  const stubs = new Map();
  for (const expr of templateExpressions(ex.html)) {
    for (const m of stripStrings(expr).matchAll(/(?<![\w$.])([A-Za-z_][\w$]*)\s*\(([^)]*)\)/g)) {
      const [, name, args] = m;
      if (wanted.has(name) || page.members.has(name) || locals.has(name) || GLOBALS.has(name)) continue;
      const params = args.trim() ? args.split(',').map((a, i) => (a.trim() === '$event' ? 'event: unknown' : `arg${i}: unknown`)) : [];
      stubs.set(name, `  protected ${name}(${params.join(', ')}): void {\n    // Tu lógica aquí.\n  }`);
    }
  }
  memberBlocks.push(...stubs.values());

  // 2) Declaraciones top-level necesarias (interfaces, tipos, constantes).
  const topWanted = new Set();
  const scan = (text) => {
    for (const id of identifiers(text)) {
      if (page.topLevel.has(id) && !topWanted.has(id)) {
        topWanted.add(id);
        scan(page.topLevel.get(id).getText());
      }
    }
  };
  extraText.forEach(scan);
  scan(ex.html);
  const topBlocks = page.sf.statements
    .filter((st) => [...topWanted].some((n) => page.topLevel.get(n) === st))
    .map((st) => indent(nodeText(st), ''));

  // 3) Imports: declarables del HTML + símbolos de la página usados en el código.
  const declarables = usedDeclarables(ex.html, registry);
  const importMap = new Map(); // module → Set(spec)
  const addImport = (module, spec) => {
    if (!importMap.has(module)) importMap.set(module, new Set());
    importMap.get(module).add(spec);
  };
  addImport('@angular/core', 'ChangeDetectionStrategy');
  addImport('@angular/core', 'Component');
  const codeIds = new Set();
  for (const t of [...extraText, ...topBlocks]) for (const id of identifiers(t)) codeIds.add(id);
  for (const id of codeIds) {
    const imp = page.imports.get(id);
    if (!imp || imp.module.startsWith('.')) continue;
    const spec = imp.name === id ? id : `${imp.name} as ${id}`;
    addImport(imp.module, imp.typeOnly ? `type ${spec}` : spec);
  }
  for (const [clsName, module] of declarables) {
    // Respeta el alias con el que la página importa la clase, si existe.
    const local = [...page.imports.entries()].find(([, v]) => v.name === clsName && !v.module.startsWith('.'));
    addImport(local ? local[1].module : module, clsName);
  }

  const order = (m) => (m.startsWith('@angular/') ? 0 : m.startsWith('@caribeng/') ? 2 : 1);
  const importLines = [...importMap.entries()]
    .sort(([a], [b]) => order(a) - order(b) || a.localeCompare(b))
    .map(([module, specs]) => {
      const list = [...specs].sort((a, b) => a.replace('type ', '').localeCompare(b.replace('type ', '')));
      const line = `import { ${list.join(', ')} } from '${module}';`;
      return line.length <= 100 ? line : `import {\n${list.map((s) => `  ${s},`).join('\n')}\n} from '${module}';`;
    });

  // 4) Ensamblado.
  const base = pageName.replace(/-doc$|-template$|-component$/, '');
  const exampleName = kebab(ex.id || ex.title) || 'example';
  const selector = `app-${base}-${exampleName}`.replace(/-+/g, '-');
  const className = `${pascal(base)}${pascal(exampleName)}Example`;
  const imports = [...declarables.keys()];
  // Notas `// …` dentro del snippet HTML pasan a comentarios HTML válidos.
  const html = ex.html.replace(/^(\s*)\/\/\s?(.*)$/gm, '$1<!-- $2 -->');
  const templateBody = indent(html.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${'), '    ');

  const parts = [importLines.join('\n'), ...topBlocks];
  parts.push(
    [
      '@Component({',
      `  selector: '${selector}',`,
      '  changeDetection: ChangeDetectionStrategy.OnPush,',
      imports.length ? `  imports: [${imports.join(', ')}],` : null,
      '  template: `',
      templateBody,
      '  `,',
      '})',
      memberBlocks.length ? `export class ${className} {\n${memberBlocks.join('\n\n')}\n}` : `export class ${className} {}`,
    ]
      .filter((l) => l !== null)
      .join('\n'),
  );
  return parts.join('\n\n') + '\n';
}

// ───────────────────────── Avisos ─────────────────────────

const TEMPLATE_KEYWORDS = new Set([
  'true', 'false', 'null', 'undefined', 'this', 'typeof', 'in', 'of', 'as', 'track', 'let', 'else',
  '$event', '$index', '$first', '$last', '$even', '$odd', '$count',
]);

/**
 * Nombres del HTML de un ejemplo que no existen en su página. El TS generado
 * no los puede incluir, así que quedaría incompleto: el ejemplo debe usar los
 * nombres reales de la página.
 */
function unresolved(page, ex) {
  const locals = templateLocals(ex.html);
  const missing = new Set();
  // Los handlers de eventos que no existen (`(click)="guardar()"`) reciben un método
  // vacío en el TS generado: no cuentan. Una llamada en un binding (`[value]="pagina()"`)
  // sí, porque es un dato (signal) que falta.
  const handlerExprs = new Set();
  for (const t of tags(ex.html)) {
    for (const a of t.attrs) if (a.value != null && /^(\(|on-)/.test(a.name) && !a.name.startsWith('[(')) handlerExprs.add(decode(a.value));
  }
  for (const expr of templateExpressions(ex.html)) {
    // Las claves de objetos literales (`{ cuenta: '4829' }`) y los pipes (`| number`) no son referencias.
    let clean = stripStrings(expr)
      .replace(/([{,]\s*)[A-Za-z_$][\w$]*\s*:/g, '$1')
      .replace(/\|\s*[A-Za-z_$][\w$]*/g, '');
    if (handlerExprs.has(expr)) clean = clean.replace(/(?<![\w$.])[A-Za-z_$][\w$]*\s*\(/g, '(');
    for (const id of identifiers(clean)) {
      if (page.members.has(id) || locals.has(id) || GLOBALS.has(id) || TEMPLATE_KEYWORDS.has(id)) continue;
      missing.add(id);
    }
  }
  return [...missing];
}

// ───────────────────────── Main ─────────────────────────

function main() {
  const registry = buildRegistry();
  const result = {};
  const warnings = [];
  let total = 0;
  let manual = 0;
  let conflicts = 0;
  for (const file of readdirSync(PAGES_DIR).filter((f) => f.endsWith('.ts')).sort()) {
    const page = analyzePage(join(PAGES_DIR, file));
    if (!page) continue;
    const pageName = file.replace(/\.component\.ts$/, '').replace(/\.ts$/, '');
    for (const ex of examples(page)) {
      // Un `codeTs` manual que ya es un componente completo tiene prioridad.
      const isManual = ex.manualTs && /@Component\s*\(/.test(ex.manualTs);
      const code = isManual ? ex.manualTs : generate(page, ex, registry, pageName);
      if (code === ex.manualTs) manual++;
      if (!isManual) {
        const missing = unresolved(page, ex);
        if (missing.length) warnings.push(`  ${file} #${ex.id}: ${missing.join(', ')}`);
      }
      const key = docCodeKey(ex.html);
      if (key in result && result[key] !== code) conflicts++;
      else result[key] = code;
      total++;
    }
  }
  writeFileSync(OUT_FILE, JSON.stringify(result));
  console.log(
    `doc-code: ${total} ejemplos (${manual} manuales, ${conflicts} HTML repetidos) → ${relative(ROOT, OUT_FILE)}`,
  );
  if (warnings.length) {
    console.warn(
      `doc-code: ${warnings.length} ejemplos usan nombres que no existen en su página (su TS saldrá incompleto):\n${warnings.join('\n')}`,
    );
  }
}

main();

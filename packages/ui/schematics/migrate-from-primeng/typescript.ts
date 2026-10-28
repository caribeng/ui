import * as ts from 'typescript';
import { type CaribeSymbol, ROOT_SERVICES, SOURCE_REWRITERS, SYMBOLS } from './mappings';
import { PRIME_ICONS } from './icons';
import { TODO_MARK, applyEdits } from './template';

interface Edit {
  readonly start: number;
  readonly end: number;
  readonly text: string;
}

/** `providePrimeNG` (de `primeng/config`) → `provideCaribeNG` (de `@caribeng/ui`). */
const CONFIG_SYMBOLS: ReadonlyMap<string, CaribeSymbol> = new Map([['providePrimeNG', { name: 'provideCaribeNG', entry: '@caribeng/ui' }]]);

/** Configuración que se escribe en lugar de la de PrimeNG (la misma que `ng add` por defecto). */
export const PROVIDER_CONFIG = "{ locale: 'es', theme: 'light', preset: 'emerald' }";

/** Módulos que quedan sin uso tras la migración y se eliminan si nada los referencia. */
const PRUNABLE_MODULES = /^(@primeuix\/|primeng\/config$)/;

export interface SourceResult {
  readonly text: string;
  readonly changed: boolean;
}

function parse(fileName: string, text: string): ts.SourceFile {
  return ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true);
}

function newline(text: string): string {
  return text.includes('\r\n') ? '\r\n' : '\n';
}

/** Rango de una propiedad de objeto incluyendo la coma que la separa de la siguiente. */
function propertyWithComma(sf: ts.SourceFile, prop: ts.ObjectLiteralElement): Edit {
  const text = sf.text;
  let end = prop.getEnd();
  while (end < text.length && /[ \t\r\n]/.test(text[end])) end += 1;
  if (text[end] === ',') end += 1;
  return { start: prop.getStart(sf), end, text: '' };
}

/**
 * Patrones de datos frecuentes que el migrador normaliza en el .ts:
 * - valores de severidad `'warn'`/`'error'` → `'warning'`/`'danger'` (tipo de `showToast`, etc.)
 * - propiedad `status:` → `title:` (eventos de timeline)
 * - nodos de árbol `{ label, expanded?, children? }` → añade `key` (a partir de `label`) y quita `expanded`
 */
function rewriteDataPatterns(fileName: string, text: string): string {
  const sf = parse(fileName, text);
  const edits: Edit[] = [];
  // Handlers de `(completeMethod)` de PrimeNG: `(event: { query: string }) => event.query`
  // pasan a recibir la query directamente: `(query: string) => query`.
  const visitHandler = (node: ts.Node): void => {
    if (ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      for (const param of node.parameters) {
        const type = param.type;
        if (!type || !ts.isTypeLiteralNode(type) || !ts.isIdentifier(param.name)) continue;
        const hasQuery = type.members.some((m) => ts.isPropertySignature(m) && ts.isIdentifier(m.name) && m.name.text === 'query');
        if (!hasQuery) continue;
        const oldName = param.name.text;
        const body = node.body;
        if (body) {
          const walk = (n: ts.Node): void => {
            if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === oldName && n.name.text === 'query') {
              edits.push({ start: n.getStart(sf), end: n.getEnd(), text: 'query' });
            }
            ts.forEachChild(n, walk);
          };
          walk(body);
        }
        edits.push({ start: param.getStart(sf), end: param.getEnd(), text: 'query: string' });
      }
    }
    ts.forEachChild(node, visitHandler);
  };
  visitHandler(sf);

  // Arrays de nodos de árbol: variables tipadas `CbTreeNode[]` / `TreeNode[]`.
  const treeObjectLiterals = new Set<ts.ObjectLiteralExpression>();
  const collectTreeArrays = (node: ts.Node): void => {
    if ((ts.isPropertyDeclaration(node) || ts.isVariableDeclaration(node)) && node.type && /(CbTreeNode|TreeNode)/.test(node.type.getText(sf)) && node.initializer) {
      const walk = (n: ts.Node): void => {
        if (ts.isObjectLiteralExpression(n)) treeObjectLiterals.add(n);
        ts.forEachChild(n, walk);
      };
      walk(node.initializer);
    }
    ts.forEachChild(node, collectTreeArrays);
  };
  collectTreeArrays(sf);

  for (const obj of treeObjectLiterals) {
    const props = obj.properties;
    const label = props.find((pr): pr is ts.PropertyAssignment => ts.isPropertyAssignment(pr) && ts.isIdentifier(pr.name) && pr.name.text === 'label');
    const hasKey = props.some((pr) => ts.isPropertyAssignment(pr) && ts.isIdentifier(pr.name) && pr.name.text === 'key');
    const expanded = props.find((pr) => ts.isPropertyAssignment(pr) && ts.isIdentifier(pr.name) && pr.name.text === 'expanded');
    if (label && label.initializer && !hasKey) {
      edits.push({ start: label.getStart(sf), end: label.getStart(sf), text: `key: ${label.initializer.getText(sf)}, ` });
    }
    if (expanded) {
      edits.push(propertyWithComma(sf, expanded));
    }
  }

  const visit = (node: ts.Node): void => {
    if (ts.isStringLiteral(node) && (node.text === 'warn' || node.text === 'error')) {
      edits.push({ start: node.getStart(sf), end: node.getEnd(), text: node.text === 'warn' ? "\'warning\'" : "\'danger\'" });
    }
    if (ts.isStringLiteral(node)) {
      const icon = /^pi pi-([a-z0-9-]+)$/.exec(node.text);
      if (icon) {
        edits.push({ start: node.getStart(sf), end: node.getEnd(), text: `'${PRIME_ICONS[icon[1]] ?? icon[1]}'` });
      }
    }
    if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && node.name.text === 'status') {
      edits.push({ start: node.name.getStart(sf), end: node.name.getEnd(), text: 'title' });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return edits.length ? applyEdits(text, edits) : text;
}

/** Rango de una sentencia incluyendo su salto de línea final (para borrarla sin dejar una línea vacía). */
function statementRange(sf: ts.SourceFile, node: ts.Node): { start: number; end: number } {
  const text = sf.text;
  let end = node.getEnd();
  if (text.startsWith('\r\n', end)) end += 2;
  else if (text[end] === '\n') end += 1;
  return { start: node.getStart(sf), end };
}

/** Nombres ya importados desde cada entry point de CaribeNG. */
function caribeImports(sf: ts.SourceFile): Map<string, Set<string>> {
  const imports = new Map<string, Set<string>>();
  for (const statement of sf.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const module = statement.moduleSpecifier.text;
    const bindings = statement.importClause?.namedBindings;
    if (!module.startsWith('@caribeng/') || !bindings || !ts.isNamedImports(bindings)) continue;
    const names = imports.get(module) ?? new Set<string>();
    bindings.elements.forEach((element) => names.add(element.name.text));
    imports.set(module, names);
  }
  return imports;
}

/** El identificador es un nombre de propiedad/miembro, no una referencia al símbolo importado. */
function isMemberName(node: ts.Identifier): boolean {
  const parent = node.parent;
  return (
    (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
    (ts.isQualifiedName(parent) && parent.right === node) ||
    ((ts.isPropertyAssignment(parent) ||
      ts.isPropertyDeclaration(parent) ||
      ts.isMethodDeclaration(parent) ||
      ts.isPropertySignature(parent) ||
      ts.isMethodSignature(parent) ||
      ts.isGetAccessorDeclaration(parent) ||
      ts.isSetAccessorDeclaration(parent) ||
      ts.isEnumMember(parent)) &&
      parent.name === node)
  );
}

/**
 * Cambia los imports de PrimeNG por los de CaribeNG (`ButtonModule` de
 * `primeng/button` → `CbButton` de `@caribeng/ui/button`), renombra sus usos
 * y sustituye `providePrimeNG(…)` por `provideCaribeNG(…)`. Los símbolos sin
 * equivalente se quedan importados de PrimeNG (aparecen en el informe).
 */
export function rewriteImports(fileName: string, text: string, templates: readonly string[] = []): SourceResult & { readonly icons: ReadonlySet<string> } {
  const sf = parse(fileName, text);
  const edits: Edit[] = [];
  const renames = new Map<string, string>();
  const existing = caribeImports(sf);
  const eol = newline(text);
  let providerLocal: string | undefined;

  // Reescrituras que dependen del contexto (servicios, MenuItem): van primero porque
  // pueden consumir símbolos de PrimeNG y pedir imports de CaribeNG.
  const locals = new Map<string, string>();
  for (const statement of sf.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) || !statement.moduleSpecifier.text.startsWith('primeng/')) continue;
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) bindings.elements.forEach((e) => locals.set((e.propertyName ?? e.name).text, e.name.text));
  }
  const consumed = new Set<string>();
  const requested = new Map<string, Set<string>>();
  const icons = new Set<string>();
  for (const rewriteSource of SOURCE_REWRITERS) {
    rewriteSource(
      sf,
      {
        locals,
        templates,
        icons,
        consume: (symbol) => consumed.add(symbol),
        addImport: (name, entry) => {
          if (existing.get(entry)?.has(name)) return;
          requested.set(entry, (requested.get(entry) ?? new Set<string>()).add(name));
        },
      },
      edits,
    );
  }

  for (const statement of sf.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const module = statement.moduleSpecifier.text;
    const symbols = module === 'primeng/config' ? CONFIG_SYMBOLS : SYMBOLS.get(module);
    const clause = statement.importClause;
    const bindings = clause?.namedBindings;
    if (!symbols || !clause || clause.name || !bindings || !ts.isNamedImports(bindings)) continue;

    const quote = text[statement.moduleSpecifier.getStart(sf)];
    const typePrefix = clause.isTypeOnly ? 'type ' : '';
    const groups = new Map<string, string[]>();
    const kept: string[] = [];
    let dropped = false;
    for (const element of bindings.elements) {
      const imported = (element.propertyName ?? element.name).text;
      if (consumed.has(imported)) {
        dropped = true;
        continue;
      }
      const target = symbols.get(imported);
      if (!target) {
        kept.push(element.getText(sf));
        continue;
      }
      const local = element.name.text;
      if (module === 'primeng/config') {
        providerLocal = local;
        // Con provideCaribeNG() ya importado no hace falta importarlo otra vez.
        if (existing.get(target.entry)?.has(target.name)) continue;
      }
      else if (!element.propertyName && local !== target.name) renames.set(local, target.name);

      const specifier = `${element.isTypeOnly ? 'type ' : ''}${element.propertyName ? `${target.name} as ${local}` : target.name}`;
      const names = existing.get(target.entry) ?? new Set<string>();
      const group = groups.get(target.entry) ?? [];
      if ((element.propertyName || !names.has(target.name)) && !group.includes(specifier)) group.push(specifier);
      // Con alias el nombre local es otro: `CbDialog` sigue sin estar importado.
      if (!element.propertyName) names.add(target.name);
      existing.set(target.entry, names);
      groups.set(target.entry, group);
    }
    if (!groups.size && !dropped) continue;

    const lines = [...groups]
      .filter(([, names]) => names.length)
      .map(([entry, names]) => `import ${typePrefix}{ ${names.join(', ')} } from ${quote}${entry}${quote};`);
    if (kept.length) lines.push(`import ${typePrefix}{ ${kept.join(', ')} } from ${quote}${module}${quote};`);
    const range = lines.length ? { start: statement.getStart(sf), end: statement.getEnd() } : statementRange(sf, statement);
    edits.push({ ...range, text: lines.join(eol) });
  }

  // Si `ng add @caribeng/ui` ya registró provideCaribeNG(), providePrimeNG() se elimina en vez de sustituirse.
  const hasCaribeProvider = /\bprovideCaribeNG\s*\(/.test(text);

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) return;
    if (providerLocal && ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === providerLocal) {
      if (hasCaribeProvider && ts.isArrayLiteralExpression(node.parent)) {
        const elements = node.parent.elements;
        const i = elements.indexOf(node);
        edits.push(i > 0 ? { start: elements[i - 1].getEnd(), end: node.getEnd(), text: '' } : { start: node.getStart(sf), end: elements[1]?.getStart(sf) ?? node.getEnd(), text: '' });
        return;
      }
      edits.push({
        start: node.getStart(sf),
        end: node.getEnd(),
        text: `provideCaribeNG(${PROVIDER_CONFIG}) /* ${TODO_MARK}: elige locale, theme y preset; la configuración de PrimeNG (tema, ripple, zIndex…) no se traslada. */`,
      });
      return;
    }
    if (ts.isIdentifier(node) && !isMemberName(node)) {
      const renamed = renames.get(node.text);
      if (renamed) {
        const shorthand = ts.isShorthandPropertyAssignment(node.parent) && node.parent.name === node;
        edits.push({ start: node.getStart(sf), end: node.getEnd(), text: shorthand ? `${node.text}: ${renamed}` : renamed });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  // Imports pedidos por las reescrituras (p. ej. CbMenubarItem): tras el último import;
  // mergeCaribeImports los une con los que ya hubiera del mismo entry point.
  if (requested.size) {
    const imports = sf.statements.filter(ts.isImportDeclaration);
    const position = imports.length ? imports[imports.length - 1].getEnd() : 0;
    const lines = [...requested].map(([entry, names]) => `import { ${[...names].join(', ')} } from '${entry}';`);
    edits.push({ start: position, end: position, text: imports.length ? eol + lines.join(eol) : lines.join(eol) + eol });
  }

  if (!edits.length) {
    const data = rewriteDataPatterns(fileName, text);
    return { text: data, changed: data !== text, icons };
  }
  const withData = rewriteDataPatterns(fileName, applyEdits(text, edits));
  const rewritten = mergeCaribeImports(fileName, cleanDecoratorArrays(fileName, withData));
  return { text: pruneUnusedImports(fileName, rewritten), changed: true, icons };
}

/**
 * Limpia los arrays de los decoradores tras renombrar:
 * - `imports: [ButtonModule, Button]` quedaría `[CbButton, CbButton]`: se deja uno.
 * - `providers: [MessageService]` quedaría `[CbToastService]`: se quita, porque
 *   es `providedIn: 'root'` y una instancia local no compartiría los mensajes.
 */
function cleanDecoratorArrays(fileName: string, text: string): string {
  const sf = parse(fileName, text);
  const edits: Edit[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && ts.isArrayLiteralExpression(node.initializer)) {
      const property = node.name.text;
      const elements = node.initializer.elements;
      if (['imports', 'exports', 'providers'].includes(property) && elements.length) {
        const seen = new Set<string>();
        const kept = elements.filter((element) => {
          if (!ts.isIdentifier(element)) return true;
          const drop = seen.has(element.text) || (property === 'providers' && ROOT_SERVICES.has(element.text));
          seen.add(element.text);
          return !drop;
        });
        if (kept.length !== elements.length) {
          const first = elements[0];
          const last = elements[elements.length - 1];
          const between = text.slice(first.getEnd(), elements[1]?.getStart(sf) ?? first.getEnd());
          // Array en varias líneas: se conserva el separador original (coma + salto + sangría).
          const separator = between.includes('\n') ? between : ', ';
          edits.push({ start: first.getStart(sf), end: last.getEnd(), text: kept.map((element) => element.getText(sf)).join(separator) });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return edits.length ? applyEdits(text, edits) : text;
}

/**
 * Une los imports del mismo entry point de CaribeNG (`MessageService` de
 * primeng/api y `ToastModule` de primeng/toast acaban ambos en @caribeng/ui/toast).
 */
function mergeCaribeImports(fileName: string, text: string): string {
  const sf = parse(fileName, text);
  const first = new Map<string, ts.ImportDeclaration>();
  const extra = new Map<ts.ImportDeclaration, string[]>();
  const edits: Edit[] = [];
  for (const statement of sf.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const clause = statement.importClause;
    const module = statement.moduleSpecifier.text;
    if (!module.startsWith('@caribeng/') || !clause || clause.name || clause.isTypeOnly || !clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) continue;
    const target = first.get(module);
    if (!target) {
      first.set(module, statement);
      continue;
    }
    const names = extra.get(target) ?? [];
    names.push(...clause.namedBindings.elements.map((element) => element.getText(sf)));
    extra.set(target, names);
    edits.push({ ...statementRange(sf, statement), text: '' });
  }
  for (const [target, names] of extra) {
    const elements = (target.importClause!.namedBindings as ts.NamedImports).elements;
    const present = new Set(elements.map((element) => element.getText(sf)));
    const missing = [...new Set(names)].filter((name) => !present.has(name));
    if (missing.length) edits.push({ start: elements[elements.length - 1].getEnd(), end: elements[elements.length - 1].getEnd(), text: `, ${missing.join(', ')}` });
  }
  return edits.length ? applyEdits(text, edits) : text;
}

/** Quita los imports de `@primeuix/*` y `primeng/config` que ya nada usa (p. ej. el preset `Aura`). */
function pruneUnusedImports(fileName: string, text: string): string {
  const sf = parse(fileName, text);
  const used = new Set<string>();
  const collect = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) return;
    if (ts.isIdentifier(node) && !isMemberName(node)) used.add(node.text);
    ts.forEachChild(node, collect);
  };
  collect(sf);

  const edits: Edit[] = [];
  for (const statement of sf.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    if (!PRUNABLE_MODULES.test(statement.moduleSpecifier.text) || !statement.importClause) continue;
    const clause = statement.importClause;
    const locals = [clause.name?.text, ...(clause.namedBindings && ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements.map((e) => e.name.text) : [])];
    if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) locals.push(clause.namedBindings.name.text);
    if (locals.every((local) => !local || !used.has(local))) edits.push({ ...statementRange(sf, statement), text: '' });
  }
  return edits.length ? applyEdits(text, edits) : text;
}

/** Un `@Component` del archivo. */
export interface ComponentInfo {
  /** Posición del componente en el archivo (para volver a encontrarlo tras editar). */
  readonly index: number;
  /** Plantilla en línea (contenido ya sin escapes). */
  readonly inlineTemplate?: string;
  /** Ruta de `templateUrl`, tal cual. */
  readonly templateUrl?: string;
  /** `standalone: false` (declarado en un NgModule). */
  readonly declaredInModule: boolean;
}

function componentDecorators(sf: ts.SourceFile): ts.ObjectLiteralExpression[] {
  const found: ts.ObjectLiteralExpression[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isDecorator(node) && ts.isCallExpression(node.expression) && ts.isIdentifier(node.expression.expression) && node.expression.expression.text === 'Component') {
      const [config] = node.expression.arguments;
      if (config && ts.isObjectLiteralExpression(config)) found.push(config);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

function property(config: ts.ObjectLiteralExpression, name: string): ts.PropertyAssignment | undefined {
  return config.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === name);
}

/** Componentes del archivo con su plantilla. */
export function findComponents(fileName: string, text: string): ComponentInfo[] {
  return componentDecorators(parse(fileName, text)).map((config, index) => {
    const template = property(config, 'template')?.initializer;
    const templateUrl = property(config, 'templateUrl')?.initializer;
    const standalone = property(config, 'standalone')?.initializer;
    return {
      index,
      inlineTemplate: template && ts.isStringLiteralLike(template) ? template.text : undefined,
      templateUrl: templateUrl && ts.isStringLiteralLike(templateUrl) ? templateUrl.text : undefined,
      declaredInModule: standalone?.kind === ts.SyntaxKind.FalseKeyword,
    };
  });
}

/** Sustituye la plantilla en línea del componente `index` (se escribe como template literal). */
export function replaceInlineTemplate(fileName: string, text: string, index: number, template: string): string {
  const literal = property(componentDecorators(parse(fileName, text))[index], 'template')!.initializer;
  const escaped = template.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  return applyEdits(text, [{ start: literal.getStart(), end: literal.getEnd(), text: `\`${escaped}\`` }]);
}

/**
 * Añade al `imports` de cada componente los símbolos CaribeNG que usa su
 * plantilla, y sus `import` de TypeScript. Devuelve también los que no se
 * pudieron añadir (componentes de NgModule o con `imports` no literal).
 */
export function ensureComponentImports(
  fileName: string,
  text: string,
  needed: ReadonlyMap<number, readonly CaribeSymbol[]>,
): SourceResult & { readonly manual: readonly string[] } {
  const sf = parse(fileName, text);
  const decorators = componentDecorators(sf);
  const edits: Edit[] = [];
  const manual: string[] = [];
  const toImport = new Map<string, Set<string>>();
  const existing = caribeImports(sf);
  const eol = newline(text);

  for (const [index, symbols] of needed) {
    const config = decorators[index];
    if (!config || !symbols.length) continue;
    const standalone = property(config, 'standalone')?.initializer;
    const imports = property(config, 'imports');
    const names = symbols.map((s) => s.name);
    if (standalone?.kind === ts.SyntaxKind.FalseKeyword || (imports && !ts.isArrayLiteralExpression(imports.initializer))) {
      manual.push(...names);
      continue;
    }

    const present = new Set(imports && ts.isArrayLiteralExpression(imports.initializer) ? imports.initializer.elements.map((e) => e.getText(sf)) : []);
    const missing = symbols.filter((s) => !present.has(s.name));
    if (missing.length) {
      const list = missing.map((s) => s.name).join(', ');
      if (imports && ts.isArrayLiteralExpression(imports.initializer)) {
        const array = imports.initializer;
        const last = array.elements[array.elements.length - 1];
        if (last) edits.push({ start: last.getEnd(), end: last.getEnd(), text: `, ${list}` });
        else edits.push({ start: array.getStart(sf) + 1, end: array.getEnd() - 1, text: list });
      } else {
        const last = config.properties[config.properties.length - 1];
        const indent = /[ \t]*$/.exec(text.slice(0, last.getStart(sf)))?.[0] ?? '  ';
        edits.push({ start: last.getEnd(), end: last.getEnd(), text: `,${eol}${indent}imports: [${list}]` });
      }
    }
    for (const symbol of symbols) {
      if (existing.get(symbol.entry)?.has(symbol.name)) continue;
      const set = toImport.get(symbol.entry) ?? new Set<string>();
      set.add(symbol.name);
      toImport.set(symbol.entry, set);
    }
  }

  if (toImport.size) {
    const declarations = sf.statements.filter(ts.isImportDeclaration);
    const lastImport = declarations[declarations.length - 1];
    const newLines: string[] = [];
    for (const [entry, names] of [...toImport].sort(([a], [b]) => a.localeCompare(b))) {
      const current = declarations.find(
        (d) => ts.isStringLiteral(d.moduleSpecifier) && d.moduleSpecifier.text === entry && !d.importClause?.isTypeOnly && d.importClause?.namedBindings && ts.isNamedImports(d.importClause.namedBindings),
      );
      const elements = current && (current.importClause!.namedBindings as ts.NamedImports).elements;
      if (elements?.length) {
        const end = elements[elements.length - 1].getEnd();
        edits.push({ start: end, end, text: `, ${[...names].join(', ')}` });
      } else {
        newLines.push(`import { ${[...names].join(', ')} } from '${entry}';`);
      }
    }
    if (newLines.length) {
      const position = lastImport ? lastImport.getEnd() : 0;
      const block = newLines.join(eol);
      edits.push({ start: position, end: position, text: lastImport ? `${eol}${block}` : `${block}${eol}` });
    }
  }

  if (!edits.length) return { text, changed: false, manual };
  return { text: applyEdits(text, edits), changed: true, manual };
}

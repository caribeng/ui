import { type Rule, type SchematicContext, SchematicsException, type Tree, chain } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addRootProvider, readWorkspace } from '@schematics/angular/utility';
import { addStyles, containsText } from '../ng-add/index';
import { catalogExport, isCoreIcon } from './icons';
import { ATTR_SYMBOLS, type CaribeSymbol, TAG_SYMBOLS } from './mappings';
import { REPORT_PATH, renderReport, scanWorkspace } from './report';
import type { Schema } from './schema';
import { type Compiler, loadCompiler, rewriteTemplate } from './template';
import { PROVIDER_CONFIG, ensureComponentImports, findComponents, replaceInlineTemplate, rewriteImports } from './typescript';
import { dependencyVersion, majorOf, readPackageJson, removePrimeDependencies, removePrimeStyleEntries, removePrimeStyleImports, workspaceFiles } from './workspace';

/** Versión mínima de PrimeNG con la que se escribieron los mapeos (`p-select` existe desde la 18). */
const MIN_PRIMENG_MAJOR = 18;

const STYLESHEET = /\.(css|scss|sass|less)$/;
const WORKSPACE_CONFIG = /(^|\/)(angular|project)\.json$/;

/** Aplicación del workspace (para estilos, proveedor e iconos). */
interface App {
  readonly name: string;
  readonly root: string;
  readonly sourceRoot: string;
}

/** Estado acumulado mientras se migran los archivos. */
interface Migration {
  readonly compiler: Compiler;
  readonly context: SchematicContext;
  readonly changed: Set<string>;
  /** Iconos de CaribeNG usados en cada archivo. */
  readonly icons: Map<string, Set<string>>;
  /** Plantillas `templateUrl` ya migradas desde su componente. */
  readonly templates: Set<string>;
  /** Símbolos que hay que añadir a mano (componentes de NgModule). */
  readonly manual: string[];
}

/**
 * `ng generate @caribeng/ui:migrate-from-primeng`: traduce un proyecto
 * PrimeNG a CaribeNG. Cambia imports, plantillas, iconos, estilos y el
 * proveedor; lo que no puede traducir con seguridad lo marca con
 * `TODO(caribeng)` y lo resume en `caribeng-migration-report.md`.
 */
export function migrateFromPrimeng(options: Schema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    checkPreconditions(tree, options);
    context.logger.info('Migrando de PrimeNG a CaribeNG. Revisa el resultado con `git diff` antes de hacer commit.');

    const migration: Migration = {
      compiler: await loadCompiler(),
      context,
      changed: new Set(),
      icons: new Map(),
      templates: new Set(),
      manual: [],
    };
    const root = normalizeRoot(options.path);
    const files = workspaceFiles(tree, root);

    for (const path of files) {
      if (/\.(ts|mts)$/.test(path) && !path.endsWith('.d.ts')) migrateSource(tree, path, migration);
    }
    for (const path of files) {
      if (path.endsWith('.html') && !migration.templates.has(path)) migrateHtml(tree, path, migration);
      else if (STYLESHEET.test(path)) migrateStylesheet(tree, path, migration);
    }
    for (const path of workspaceFiles(tree)) {
      if (WORKSPACE_CONFIG.test(path) && removePrimeStyleEntries(tree, path, context)) migration.changed.add(path);
    }

    const apps = await applications(tree, context);
    return chain([
      ...apps.map((app) => addStyles(app.name)),
      ...apps.map((app) => ensureProvider(app)),
      ...apps.map((app) => registerIcons(app, migration)),
      finish(options, migration),
    ]);
  };
}

function checkPreconditions(tree: Tree, options: Schema): void {
  const pkg = readPackageJson(tree);
  if (!pkg) throw new SchematicsException('No se encontró package.json en la raíz del workspace.');
  if (options.force) return;
  if (!dependencyVersion(pkg, '@caribeng/ui')) {
    throw new SchematicsException('Instala CaribeNG antes de migrar:\n  npm install @caribeng/ui@22\nUsa --force para migrar igualmente.');
  }
  const primeng = dependencyVersion(pkg, 'primeng');
  if (!primeng) throw new SchematicsException('primeng no está en package.json. Usa --force para migrar igualmente.');
  const major = majorOf(primeng);
  if (major !== null && major < MIN_PRIMENG_MAJOR) {
    throw new SchematicsException(
      `Se encontró PrimeNG ${primeng}. El migrador admite PrimeNG ${MIN_PRIMENG_MAJOR} o superior: actualiza primero (ng update primeng@${MIN_PRIMENG_MAJOR}) o usa --force.`,
    );
  }
}

function normalizeRoot(path: string | undefined): string {
  const clean = (path ?? '/').replace(/\\/g, '/').replace(/^\.?\/*/, '/').replace(/\/+$/, '');
  return clean || '/';
}

function dirname(path: string): string {
  return path.slice(0, path.lastIndexOf('/')) || '/';
}

/** `../shared/x.html` relativo a `/src/app/a/a.ts` → `/src/app/shared/x.html`. */
function resolvePath(from: string, relative: string): string {
  const parts = dirname(from).split('/');
  for (const part of relative.replace(/^\.\//, '').split('/')) {
    if (part === '..') parts.pop();
    else if (part !== '.') parts.push(part);
  }
  return parts.join('/');
}

/** Tags (`cb-button`) y directivas (`cbTooltip`) CaribeNG que aparecen en `after` pero no en `before` → símbolos a importar. */
function introducedSymbols(before: string, after: string): CaribeSymbol[] {
  const tags = (text: string) => new Set([...text.matchAll(/<(cb-[a-z0-9-]+)/g)].map((m) => m[1]));
  const attrs = (text: string) => new Set([...text.matchAll(/[\s[](cb[A-Z][A-Za-z]*)\]?(?=[\s=/>])/g)].map((m) => m[1]));
  const symbols = new Map<string, CaribeSymbol>();
  for (const [found, index] of [
    [tags, TAG_SYMBOLS],
    [attrs, ATTR_SYMBOLS],
  ] as const) {
    const previous = found(before);
    for (const name of found(after)) {
      const symbol = index.get(name);
      if (symbol && !previous.has(name)) symbols.set(symbol.name, symbol);
    }
  }
  return [...symbols.values()];
}

function addIcons(migration: Migration, path: string, icons: ReadonlySet<string>): void {
  if (!icons.size) return;
  const set = migration.icons.get(path) ?? new Set<string>();
  icons.forEach((icon) => set.add(icon));
  migration.icons.set(path, set);
}

/** Un `.ts`: imports, plantilla (en línea o `templateUrl`) e `imports` del componente. */
function migrateSource(tree: Tree, path: string, migration: Migration): void {
  const original = tree.readText(path);
  let text = rewriteImports(path, original).text;
  const needed = new Map<number, CaribeSymbol[]>();

  for (const component of findComponents(path, text)) {
    let before: string | undefined;
    let after: string | undefined;
    if (component.inlineTemplate !== undefined) {
      const result = rewriteTemplate(migration.compiler, component.inlineTemplate, path);
      if (result.error) migration.context.logger.warn(`${path}: la plantilla no se pudo analizar y no se migró.\n${result.error}`);
      if (result.changed) {
        text = replaceInlineTemplate(path, text, component.index, result.text);
        [before, after] = [component.inlineTemplate, result.text];
        addIcons(migration, path, result.icons);
      }
    } else if (component.templateUrl) {
      const templatePath = resolvePath(path, component.templateUrl);
      if (!tree.exists(templatePath) || migration.templates.has(templatePath)) continue;
      migration.templates.add(templatePath);
      const html = tree.readText(templatePath);
      const result = rewriteTemplate(migration.compiler, html, templatePath);
      if (result.error) migration.context.logger.warn(`${templatePath}: la plantilla no se pudo analizar y no se migró.\n${result.error}`);
      if (result.changed) {
        tree.overwrite(templatePath, result.text);
        migration.changed.add(templatePath);
        [before, after] = [html, result.text];
        addIcons(migration, templatePath, result.icons);
      }
    }
    if (before !== undefined && after !== undefined) needed.set(component.index, introducedSymbols(before, after));
  }

  const imports = ensureComponentImports(path, text, needed);
  text = imports.text;
  migration.manual.push(...imports.manual.map((name) => `\`${path.slice(1)}\`: añade \`${name}\` a los imports del NgModule que declara el componente.`));

  if (text !== original) {
    tree.overwrite(path, text);
    migration.changed.add(path);
  }
}

/** Un `.html` que no es plantilla de ningún componente migrado (p. ej. de otro proyecto). */
function migrateHtml(tree: Tree, path: string, migration: Migration): void {
  const result = rewriteTemplate(migration.compiler, tree.readText(path), path);
  if (result.error) {
    migration.context.logger.warn(`${path}: no se pudo analizar y no se migró.`);
    return;
  }
  if (!result.changed) return;
  tree.overwrite(path, result.text);
  migration.changed.add(path);
  addIcons(migration, path, result.icons);
  if (introducedSymbols('', result.text).length) {
    migration.manual.push(`\`${path.slice(1)}\`: no se encontró su componente; importa los componentes CaribeNG que usa.`);
  }
}

function migrateStylesheet(tree: Tree, path: string, migration: Migration): void {
  const original = tree.readText(path);
  const text = removePrimeStyleImports(original);
  if (text === original) return;
  tree.overwrite(path, text);
  migration.changed.add(path);
}

/** Aplicaciones de angular.json. En workspaces sin angular.json (Nx) devuelve [] y avisa. */
async function applications(tree: Tree, context: SchematicContext): Promise<App[]> {
  try {
    const workspace = await readWorkspace(tree);
    return [...workspace.projects.entries()]
      .filter(([, project]) => project.extensions['projectType'] === 'application')
      .map(([name, project]) => {
        const root = project.root ? `/${project.root.replace(/^\/|\/$/g, '')}` : '';
        return { name, root, sourceRoot: project.sourceRoot ? `/${project.sourceRoot.replace(/^\/|\/$/g, '')}` : `${root}/src` };
      });
  } catch {
    context.logger.warn('No se encontró angular.json: añade a mano @caribeng/ui/styles.css a los estilos y provideCaribeNG() a la configuración de la app.');
    return [];
  }
}

/** Si la app no tiene provideCaribeNG() (no usaba providePrimeNG), se añade. */
function ensureProvider(app: App): Rule {
  return (tree: Tree) => {
    if (containsText(tree, app.sourceRoot, 'provideCaribeNG(')) return;
    return addRootProvider(app.name, ({ code, external }) => code`${external('provideCaribeNG', '@caribeng/ui')}(${PROVIDER_CONFIG})`);
  };
}

/** Registra con provideCbIcons los iconos usados que no son del set núcleo. */
function registerIcons(app: App, migration: Migration): Rule {
  return () => {
    const names = new Set<string>();
    for (const [path, icons] of migration.icons) {
      if (path.startsWith(`${app.root}/`) || app.root === '') icons.forEach((icon) => isCoreIcon(icon) || names.add(icon));
    }
    if (!names.size) return;
    return addRootProvider(app.name, ({ code, external }) => {
      const entries = [...names].sort().map((name) => `'${name}': ${external(catalogExport(name), '@caribeng/ui/icons')}`);
      const expression = `${external('provideCbIcons', '@caribeng/ui/icon')}({ ${entries.join(', ')} })`;
      return code(Object.assign([expression], { raw: [expression] }) as unknown as TemplateStringsArray);
    });
  };
}

/** Informe, limpieza de package.json e instalación. */
function finish(options: Schema, migration: Migration): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const scan = scanWorkspace(tree);
    const removed = scan.leftovers.length === 0 && options.removePrimeng !== false ? removePrimeDependencies(tree) : [];

    if (options.report !== false) {
      const report = renderReport({ scan, changedFiles: [...migration.changed], manual: migration.manual, removedPackages: removed });
      if (tree.exists(REPORT_PATH)) tree.overwrite(REPORT_PATH, report);
      else tree.create(REPORT_PATH, report);
    }

    context.logger.info(`✔ ${migration.changed.size} archivo(s) migrado(s).`);
    if (removed.length) context.logger.info(`✔ Eliminados de package.json: ${removed.join(', ')}.`);
    if (scan.todos.length) context.logger.warn(`⚠ ${scan.todos.length} aviso(s) TODO(caribeng) para revisar.`);
    if (scan.leftovers.length) {
      context.logger.warn(`⚠ Quedan ${scan.leftovers.length} referencia(s) a PrimeNG sin migrar; PrimeNG sigue instalado mientras tanto.`);
    }
    if (migration.manual.length) context.logger.warn(`⚠ ${migration.manual.length} import(s) que añadir a mano.`);
    if (options.report !== false && (scan.todos.length || scan.leftovers.length || migration.manual.length)) {
      context.logger.info(`  Detalle en ${REPORT_PATH.slice(1)}`);
    }

    if (removed.length && !options.skipInstall) context.addTask(new NodePackageInstallTask());
  };
}

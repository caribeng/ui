import type { SchematicContext, Tree } from '@angular-devkit/schematics';

/** Carpetas que nunca se recorren (dependencias, salidas de build, cachés). */
const SKIP_DIRS = new Set(['node_modules', 'dist', 'tmp', 'out-tsc', 'coverage', '.git', '.angular', '.nx', '.cache', '.vscode', '.idea']);

/** Archivos del workspace bajo `root`, sin entrar en {@link SKIP_DIRS}. */
export function workspaceFiles(tree: Tree, root = '/'): string[] {
  const files: string[] = [];
  const walk = (path: string): void => {
    const dir = tree.getDir(path);
    for (const file of dir.subfiles) files.push(`${dir.path === '/' ? '' : dir.path}/${file}`);
    for (const sub of dir.subdirs) if (!SKIP_DIRS.has(sub)) walk(`${dir.path === '/' ? '' : dir.path}/${sub}`);
  };
  walk(root);
  return files;
}

/** Paquetes del ecosistema PrimeNG que se quitan al terminar (si ya nada los usa). */
export const PRIME_PACKAGES = ['primeng', 'primeicons', '@primeuix/themes', '@primeuix/styled', '@primeuix/styles', '@primeuix/utils', '@primeuix/motion', 'tailwindcss-primeui', 'primelocale'];

const DEPENDENCY_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'] as const;

type PackageJson = Partial<Record<(typeof DEPENDENCY_FIELDS)[number], Record<string, string>>>;

export function readPackageJson(tree: Tree): PackageJson | null {
  const raw = tree.exists('/package.json') ? tree.readText('/package.json') : null;
  return raw ? (JSON.parse(raw) as PackageJson) : null;
}

/** Versión declarada de un paquete, o `null`. */
export function dependencyVersion(pkg: PackageJson, name: string): string | null {
  for (const field of DEPENDENCY_FIELDS) {
    const version = pkg[field]?.[name];
    if (version) return version;
  }
  return null;
}

/** Major de una versión de package.json (`^21.1.0` → 21). `null` si no es numérica (`latest`, `workspace:*`…). */
export function majorOf(version: string): number | null {
  const match = /(\d+)\./.exec(version) ?? /^\D*(\d+)$/.exec(version);
  return match ? Number(match[1]) : null;
}

/** Quita los paquetes de PrimeNG de package.json. Devuelve los que quitó. */
export function removePrimeDependencies(tree: Tree): string[] {
  const raw = tree.readText('/package.json');
  const pkg = JSON.parse(raw) as PackageJson;
  const removed: string[] = [];
  for (const field of DEPENDENCY_FIELDS) {
    const deps = pkg[field];
    if (!deps) continue;
    for (const name of PRIME_PACKAGES) {
      if (name in deps) {
        delete deps[name];
        removed.push(name);
      }
    }
  }
  if (removed.length) {
    const indent = /^\{\r?\n([ \t]+)/.exec(raw)?.[1] ?? '  ';
    tree.overwrite('/package.json', JSON.stringify(pkg, null, indent) + '\n');
  }
  return removed;
}

/** Hoja de PrimeIcons o un tema CSS antiguo de PrimeNG (`primeng/resources/…`). */
const PRIME_STYLESHEET = /primeicons|primeng\/resources/;

/** Quita PrimeIcons y los temas CSS de PrimeNG de los `styles` de angular.json/project.json. */
export function removePrimeStyleEntries(tree: Tree, path: string, context: SchematicContext): boolean {
  const raw = tree.readText(path);
  let config: unknown;
  try {
    config = JSON.parse(raw);
  } catch {
    context.logger.warn(`${path}: no es JSON válido; revisa a mano si incluye primeicons.css.`);
    return false;
  }
  let changed = false;
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== 'object') return;
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (key === 'styles' && Array.isArray(value)) {
        const kept = value.filter((entry) => {
          const input = typeof entry === 'string' ? entry : (entry as { input?: unknown })?.input;
          return !(typeof input === 'string' && PRIME_STYLESHEET.test(input));
        });
        if (kept.length !== value.length) {
          (node as Record<string, unknown>)[key] = kept;
          changed = true;
        }
      } else {
        visit(value);
      }
    }
  };
  visit(config);
  if (changed) {
    const indent = /^\{\r?\n([ \t]+)/.exec(raw)?.[1] ?? '  ';
    tree.overwrite(path, JSON.stringify(config, null, indent) + '\n');
  }
  return changed;
}

/** `@import 'primeicons/primeicons.css';` y similares. */
const PRIME_STYLE_IMPORT = /^[ \t]*@(import|use|forward)\s+(url\()?\s*['"]?[^'"\n]*(primeicons|primeng\/resources)[^'"\n]*['"]?\s*\)?[^;\n]*;?[ \t]*\r?\n?/gm;

/** Quita los `@import` de PrimeIcons de una hoja de estilos global. */
export function removePrimeStyleImports(text: string): string {
  return text.replace(PRIME_STYLE_IMPORT, '');
}

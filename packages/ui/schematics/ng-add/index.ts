import { type Rule, type SchematicContext, SchematicsException, type Tree, chain, noop } from '@angular-devkit/schematics';
import { addRootProvider, readWorkspace, updateWorkspace } from '@schematics/angular/utility';
import type { Schema } from './schema';

/** Hoja de estilos de CaribeNG (export `./styles.css` del paquete). */
export const CARIBENG_STYLES = '@caribeng/ui/styles.css';

/** Otras formas de referirse a la misma hoja (si ya está, no se duplica). */
const STYLE_ALIASES = [
  CARIBENG_STYLES,
  '@caribeng/ui/styles/caribeng.css',
  'node_modules/@caribeng/ui/styles/caribeng.css',
  './node_modules/@caribeng/ui/styles/caribeng.css',
];

/** Targets de angular.json que llevan la lista de estilos globales. */
const STYLE_TARGETS = ['build', 'test'];

/**
 * `ng add @caribeng/ui`: registra `provideCaribeNG()` con el idioma, tema y
 * paleta elegidos, y añade la hoja de estilos a `angular.json`. Es idempotente:
 * ejecutarlo dos veces no duplica el proveedor ni los estilos.
 */
export function ngAdd(options: Schema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const project = await resolveProject(tree, options.project);
    const sourceRoot = await projectSourceRoot(tree, project);
    const hasProvider = containsText(tree, sourceRoot, 'provideCaribeNG(');

    if (hasProvider) {
      context.logger.info('ℹ provideCaribeNG() ya está configurado: no se modifica.');
    }

    return chain([
      options.styles === false ? noop() : addStyles(project),
      hasProvider
        ? noop()
        : addRootProvider(project, ({ code, external }) => code`${external('provideCaribeNG', '@caribeng/ui')}(${providerConfig(options)})`),
      logNextSteps(options),
    ]);
  };
}

/** Configuración de `provideCaribeNG()` con las opciones elegidas. */
export function providerConfig(options: Pick<Schema, 'locale' | 'theme' | 'preset'>): string {
  return `{ locale: '${options.locale ?? 'es'}', theme: '${options.theme ?? 'light'}', preset: '${options.preset ?? 'emerald'}' }`;
}

/** Proyecto indicado o, si no se indica, la aplicación del workspace (la primera si hay varias). */
async function resolveProject(tree: Tree, name: string | undefined): Promise<string> {
  const workspace = await readWorkspace(tree);
  if (name) {
    if (!workspace.projects.has(name)) throw new SchematicsException(`No existe el proyecto "${name}" en angular.json.`);
    return name;
  }
  const apps = [...workspace.projects.entries()].filter(([, p]) => p.extensions['projectType'] === 'application');
  if (!apps.length) throw new SchematicsException('No hay ninguna aplicación en angular.json. Indica una con --project.');
  return apps[0][0];
}

async function projectSourceRoot(tree: Tree, name: string): Promise<string> {
  const project = (await readWorkspace(tree)).projects.get(name)!;
  return project.sourceRoot ?? `${project.root ? project.root + '/' : ''}src`;
}

/** Añade la hoja de estilos al principio de `styles` (los estilos propios de la app la pueden sobrescribir). */
function addStyles(projectName: string): Rule {
  return updateWorkspace((workspace) => {
    const project = workspace.projects.get(projectName);
    if (!project) return;
    for (const targetName of STYLE_TARGETS) {
      const target = project.targets.get(targetName);
      if (!target) continue;
      target.options ??= {};
      const styles = Array.isArray(target.options['styles']) ? [...(target.options['styles'] as unknown[])] : [];
      const present = styles.some((entry) => STYLE_ALIASES.includes(styleInput(entry)));
      if (!present) target.options['styles'] = [CARIBENG_STYLES, ...styles] as never;
    }
  });
}

/** `styles` admite cadenas u objetos `{ input, bundleName, inject }`. */
function styleInput(entry: unknown): string {
  if (typeof entry === 'string') return entry;
  if (entry && typeof entry === 'object' && typeof (entry as { input?: unknown }).input === 'string') {
    return (entry as { input: string }).input;
  }
  return '';
}

/** Busca un texto en los `.ts` del proyecto (para no registrar el proveedor dos veces). */
function containsText(tree: Tree, root: string, text: string): boolean {
  let found = false;
  tree.getDir(root).visit((path) => {
    if (found || !path.endsWith('.ts') || path.endsWith('.spec.ts')) return;
    found = tree.readText(path).includes(text);
  });
  return found;
}

function logNextSteps(options: Schema): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    const es = options.locale !== 'en';
    const lines = es
      ? [
          '',
          '✔ CaribeNG está listo.',
          '',
          '  Importa los componentes desde su entry point, por ejemplo:',
          "    import { CbButton } from '@caribeng/ui/button';",
          '',
          '  Documentación y catálogo: https://github.com/caribeng/ui#readme',
          '',
        ]
      : [
          '',
          '✔ CaribeNG is ready.',
          '',
          '  Import components from their entry point, for example:',
          "    import { CbButton } from '@caribeng/ui/button';",
          '',
          '  Docs and catalog: https://github.com/caribeng/ui#readme',
          '',
        ];
    lines.forEach((line) => context.logger.info(line));
  };
}

import type { Tree } from '@angular-devkit/schematics';
import { TODO_MARK } from './template';
import { workspaceFiles } from './workspace';

/** Archivo del informe en la raíz del workspace. */
export const REPORT_PATH = '/caribeng-migration-report.md';

const SCANNED = /\.(ts|mts|js|mjs|html|css|scss|sass|less|json)$/;
const SKIPPED = new Set(['package.json', 'package-lock.json', 'npm-shrinkwrap.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lock']);

/** Referencias a paquetes del ecosistema PrimeNG. */
const PRIME_PACKAGE = /primeng|primeicons|@primeuix|tailwindcss-primeui|primelocale/;
/** Selectores PrimeNG en plantillas: `<p-table`, `pTooltip`, `pi pi-…`. */
const PRIME_TEMPLATE = /<p-[a-z]|\sp[A-Z][A-Za-z]+(?=[\s=>/])|\bpi pi-/;

export interface Finding {
  readonly path: string;
  readonly line: number;
  readonly text: string;
}

export interface Scan {
  /** Avisos `TODO(caribeng)` que dejó el migrador. */
  readonly todos: readonly Finding[];
  /** Referencias a PrimeNG que siguen en el código. */
  readonly leftovers: readonly Finding[];
}

/** Busca avisos y restos de PrimeNG en todo el workspace. */
export function scanWorkspace(tree: Tree): Scan {
  const todos: Finding[] = [];
  const leftovers: Finding[] = [];
  for (const path of workspaceFiles(tree)) {
    const name = path.slice(path.lastIndexOf('/') + 1);
    if (!SCANNED.test(path) || SKIPPED.has(name) || path === REPORT_PATH) continue;
    const template = /\.(html|ts)$/.test(path);
    tree
      .readText(path)
      .split(/\r?\n/)
      .forEach((line, i) => {
        const at = line.indexOf(TODO_MARK);
        if (at >= 0) {
          // Hasta el cierre del comentario: en TypeScript puede seguir código en la misma línea.
          const message = line.slice(at + TODO_MARK.length + 1).replace(/\s*(-->|\*\/)[\s\S]*$/, '').trim();
          todos.push({ path, line: i + 1, text: message });
          return;
        }
        if (PRIME_PACKAGE.test(line) || (template && PRIME_TEMPLATE.test(line))) leftovers.push({ path, line: i + 1, text: line.trim() });
      });
  }
  return { todos, leftovers };
}

export interface ReportData {
  readonly scan: Scan;
  readonly changedFiles: readonly string[];
  readonly manual: readonly string[];
  readonly removedPackages: readonly string[];
}

/** Informe en Markdown con lo migrado y lo que queda por revisar. */
export function renderReport({ scan, changedFiles, manual, removedPackages }: ReportData): string {
  const lines = ['# Migración de PrimeNG a CaribeNG', ''];
  lines.push(`- Archivos modificados: **${changedFiles.length}**`);
  lines.push(`- Avisos para revisar (\`${TODO_MARK}\`): **${scan.todos.length}**`);
  lines.push(`- Referencias a PrimeNG sin migrar: **${scan.leftovers.length}**`);
  lines.push(
    removedPackages.length
      ? `- Paquetes eliminados de package.json: ${removedPackages.map((p) => `\`${p}\``).join(', ')}`
      : '- PrimeNG sigue en package.json mientras queden referencias (las dos librerías pueden convivir).',
  );
  lines.push('');

  const section = (title: string, intro: string, findings: readonly Finding[]): void => {
    if (!findings.length) return;
    lines.push(`## ${title}`, '', intro);
    let current = '';
    for (const finding of findings) {
      if (finding.path !== current) {
        current = finding.path;
        lines.push('', `### \`${finding.path.slice(1)}\``, '');
      }
      lines.push(`- Línea ${finding.line}: ${finding.text.replace(/\|/g, '\\|')}`);
    }
    lines.push('');
  };
  section('Avisos', `El migrador dejó un comentario \`${TODO_MARK}\` en cada punto que necesita una decisión. Bórralo cuando lo resuelvas.`, scan.todos);
  section(
    'Referencias a PrimeNG pendientes',
    'Componentes, directivas o imports que esta versión del migrador aún no traduce. Migra estos usos a mano (consulta el catálogo de CaribeNG).',
    scan.leftovers,
  );

  if (manual.length) {
    lines.push('## Imports que añadir a mano', '', ...manual.map((item) => `- ${item}`), '');
  }

  lines.push('## Siguientes pasos', '');
  lines.push('1. Revisa los cambios con `git diff`.');
  lines.push('2. Resuelve los avisos y las referencias pendientes de este informe.');
  lines.push('3. Compila (`ng build`) y ejecuta los tests.');
  if (!removedPackages.length) lines.push('4. Cuando no queden referencias, vuelve a ejecutar el migrador o quita `primeng` y `primeicons` de package.json.');
  lines.push('');
  return lines.join('\n');
}

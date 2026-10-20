#!/usr/bin/env node
/**
 * Convierte CHANGELOG.md (Keep a Changelog) en datos tipados para la página
 * Changelog del showcase.
 *
 * Formato esperado:
 *   ## [22.1.0] - 2026-11-02      (o ## [Unreleased])
 *   ### Added | Changed | Fixed | Breaking | Deprecated | Removed | Security
 *   - **Componente:** descripción
 *
 * Salida: apps/showcase/src/app/data/changelog.generated.ts
 * Uso:    node apps/showcase/scripts/gen-changelog.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const SRC = join(ROOT, 'CHANGELOG.md');
const OUT = join(ROOT, 'apps/showcase/src/app/data/changelog.generated.ts');

const TYPES = {
  breaking: 'breaking',
  added: 'added',
  changed: 'changed',
  deprecated: 'deprecated',
  removed: 'removed',
  fixed: 'fixed',
  security: 'security',
};

const releases = [];
let release = null;
let type = null;

for (const [n, raw] of readFileSync(SRC, 'utf8').split(/\r?\n/).entries()) {
  const line = raw.trimEnd();
  const rel = line.match(/^## \[([^\]]+)\](?:\s*-\s*(\d{4}-\d{2}-\d{2}))?/);
  if (rel) {
    const unreleased = /^unreleased$/i.test(rel[1]);
    release = { version: unreleased ? null : rel[1], date: rel[2] ?? null, sections: [] };
    releases.push(release);
    type = null;
    continue;
  }
  const sec = line.match(/^### (\w+)/);
  if (sec && release) {
    type = TYPES[sec[1].toLowerCase()];
    if (!type) throw new Error(`CHANGELOG.md:${n + 1}: sección desconocida "${sec[1]}"`);
    release.sections.push({ type, items: [] });
    continue;
  }
  const item = line.match(/^- (?:\*\*([^*]+?):?\*\*:?\s*)?(.+)$/);
  if (item && release && type) {
    release.sections.at(-1).items.push({ component: item[1]?.replace(/:$/, '').trim() ?? '', text: item[2].trim() });
    continue;
  }
  // Continuación de un ítem en la línea siguiente.
  if (/^\s{2,}\S/.test(line) && release?.sections.at(-1)?.items.length) {
    const last = release.sections.at(-1).items.at(-1);
    last.text += ` ${line.trim()}`;
  }
}

const banner = `// GENERADO por apps/showcase/scripts/gen-changelog.mjs a partir de CHANGELOG.md.
// No editar a mano: modifica CHANGELOG.md y ejecuta \`pnpm docs:changelog\` (o el build).
`;
const body = `import type { CbChangelogRelease } from './changelog.model';

export const CHANGELOG: readonly CbChangelogRelease[] = ${JSON.stringify(releases, null, 2)};
`;
writeFileSync(OUT, banner + body);
const total = releases.reduce((n, r) => n + r.sections.reduce((m, s) => m + s.items.length, 0), 0);
console.log(`changelog: ${releases.length} versiones, ${total} cambios → ${relative(ROOT, OUT)}`);

#!/usr/bin/env node
/**
 * Compila los schematics de `ng add @caribeng/ui` (CommonJS, como exige Angular
 * CLI) y copia sus JSON (collection.json y schema.json).
 *
 * - Sin argumentos: compila a dist/packages/ui/schematics (se publica con el paquete).
 *   Debe ejecutarse DESPUÉS de `nx build ui`: ng-packagr vacía dist/packages/ui.
 * - Con `--test`: compila también los .spec.ts a dist/out-tsc/schematics y los
 *   ejecuta con el test runner de Node.
 *
 * Uso: nx run ui:build-schematics   ·   nx run ui:test-schematics
 */
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const SRC = join(ROOT, 'packages/ui/schematics');
const test = process.argv.includes('--test');
const OUT = test ? join(ROOT, 'dist/out-tsc/schematics') : join(ROOT, 'dist/packages/ui/schematics');
const tsconfig = join(SRC, test ? 'tsconfig.spec.json' : 'tsconfig.json');

if (!test && !existsSync(join(ROOT, 'dist/packages/ui/package.json'))) {
  console.error('No existe dist/packages/ui: compila antes con nx run ui:build');
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');
execFileSync(process.execPath, [tsc, '-p', tsconfig], { stdio: 'inherit', cwd: ROOT });

// Los JSON no los emite tsc: se copian con la misma estructura de carpetas.
const jsonFiles = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith('.json') && !name.startsWith('tsconfig')) jsonFiles.push(path);
  }
};
walk(SRC);
for (const file of jsonFiles) {
  const target = join(OUT, relative(SRC, file));
  mkdirSync(dirname(target), { recursive: true });
  cpSync(file, target);
}
// El migrador necesita saber qué iconos son del set núcleo (se registran solos).
const coreIconsSource = readFileSync(join(ROOT, 'packages/ui/icon/src/lib/icons.ts'), 'utf8');
const coreIcons = [...coreIconsSource.matchAll(/^\s+"([a-z0-9-]+)":/gm)].map((m) => m[1]);
if (!coreIcons.length) throw new Error('No se encontraron iconos núcleo en icon/src/lib/icons.ts');
writeFileSync(join(OUT, 'migrate-from-primeng/core-icons.json'), JSON.stringify(coreIcons) + '\n');

console.log(`schematics: compilados en ${relative(ROOT, OUT)} (+${jsonFiles.length} JSON, ${coreIcons.length} iconos núcleo)`);

if (test) {
  const specs = [];
  const findSpecs = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) findSpecs(path);
      else if (name.endsWith('.spec.js')) specs.push(path);
    }
  };
  findSpecs(OUT);
  execFileSync(process.execPath, ['--test', ...specs], { stdio: 'inherit', cwd: ROOT });
}

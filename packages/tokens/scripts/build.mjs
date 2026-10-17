// Build de @caribeng/tokens: compila SCSS -> CSS y arma el paquete publicable.
// Cross-platform (Node ESM). No usa shell.
import { compile } from 'sass';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, '..');
const workspaceRoot = resolve(pkgRoot, '..', '..');
const src = resolve(pkgRoot, 'src', 'scss');
const dest = resolve(workspaceRoot, 'dist', 'packages', 'tokens');

rmSync(dest, { recursive: true, force: true });
mkdirSync(resolve(dest, 'css'), { recursive: true });

// 1) Compilar el CSS completo (tokens + utilidades).
const { css } = compile(resolve(src, 'index.scss'), {
  style: 'expanded',
  sourceMap: false,
});
const banner = `/*! CaribeNG tokens · @caribeng/tokens · MIT */\n`;
writeFileSync(resolve(dest, 'css', 'caribeng.css'), banner + css, 'utf8');

// 2) Copiar los fuentes SCSS (para consumidores Sass).
cpSync(src, resolve(dest, 'scss'), { recursive: true });

// 3) Copiar package.json y README al dist.
cpSync(resolve(pkgRoot, 'package.json'), resolve(dest, 'package.json'));
const readme = resolve(pkgRoot, 'README.md');
try {
  cpSync(readme, resolve(dest, 'README.md'));
} catch {
  /* README opcional */
}

// 4) Verificación mínima.
const out = readFileSync(resolve(dest, 'css', 'caribeng.css'), 'utf8');
if (!out.includes('--cb-color-primary-500')) {
  throw new Error('Build de tokens falló: no se encontró --cb-color-primary-500 en el CSS.');
}

console.log(`[tokens] OK -> ${resolve(dest, 'css', 'caribeng.css')} (${out.length} bytes)`);

// Build de los estilos/tokens de CaribeNG: compila SCSS -> CSS y los entrega
// DENTRO del paquete único @caribeng/ui (en dist/packages/ui/styles), parcheando
// su `exports`. Así el consumidor instala una sola librería y obtiene también el
// CSS: `@caribeng/ui/styles.css` o, con Sass, `@use '@caribeng/ui/styles'`.
// Cross-platform (Node ESM). No usa shell. Depende de que ui:build corra antes
// (dependsOn en project.json), porque ng-packagr limpia dist/packages/ui.
import { compile } from 'sass';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, '..');
const workspaceRoot = resolve(pkgRoot, '..', '..');
const src = resolve(pkgRoot, 'src', 'scss');
const uiDist = resolve(workspaceRoot, 'dist', 'packages', 'ui');
const dest = resolve(uiDist, 'styles');

if (!existsSync(uiDist)) {
  throw new Error(
    `No existe ${uiDist}. Ejecuta primero "nx build ui" (styles depende de ui:build).`,
  );
}

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });

// 1) Compilar el CSS completo (tokens + utilidades).
const { css } = compile(resolve(src, 'index.scss'), {
  style: 'expanded',
  sourceMap: false,
});
const banner = `/*! CaribeNG · @caribeng/ui/styles · MIT */\n`;
writeFileSync(resolve(dest, 'caribeng.css'), banner + css, 'utf8');

// 2) Copiar los fuentes SCSS (para consumidores Sass).
cpSync(src, resolve(dest, 'scss'), { recursive: true });

// 3) Parchear el package.json publicable de @caribeng/ui con los exports de estilos.
const pkgPath = resolve(uiDist, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.exports ||= {};
pkg.exports['./styles'] = {
  sass: './styles/scss/index.scss',
  style: './styles/caribeng.css',
  default: './styles/caribeng.css',
};
pkg.exports['./styles.css'] = './styles/caribeng.css';
pkg.exports['./styles/caribeng.css'] = './styles/caribeng.css';
pkg.exports['./styles/scss/*'] = './styles/scss/*';
pkg.sideEffects = Array.isArray(pkg.sideEffects)
  ? pkg.sideEffects
  : ['./styles/caribeng.css'];
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

// 4) Verificación mínima.
const out = readFileSync(resolve(dest, 'caribeng.css'), 'utf8');
if (!out.includes('--cb-color-primary-500')) {
  throw new Error('Build de estilos falló: no se encontró --cb-color-primary-500 en el CSS.');
}

console.log(`[styles] OK -> ${resolve(dest, 'caribeng.css')} (${out.length} bytes) + exports parcheados`);

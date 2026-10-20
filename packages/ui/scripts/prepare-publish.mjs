#!/usr/bin/env node
/**
 * Prepara dist/packages/ui para `npm publish`: elimina los source maps y las
 * referencias `//# sourceMappingURL` que apuntan a ellos.
 *
 * El repositorio es privado, y los source maps incluyen el código TypeScript
 * original completo (`sourcesContent`). Igual que PrimeNG (repo privado, paquete
 * público), se publica solo el JavaScript compilado. Sin las referencias, las
 * apps que consumen la librería no muestran avisos de "source map no encontrado".
 *
 * Uso: nx run ui:prepare-publish   (compila antes)
 */
import { readdirSync, readFileSync, statSync, unlinkSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '../../../dist/packages/ui');
if (!existsSync(join(DIST, 'package.json'))) {
  console.error(`No existe ${DIST}/package.json: compila antes con nx run ui:build`);
  process.exit(1);
}

let removed = 0;
let stripped = 0;
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
    } else if (name.endsWith('.map')) {
      unlinkSync(path);
      removed++;
    } else if (/\.(m?js|css)$/.test(name)) {
      const src = readFileSync(path, 'utf8');
      const out = src.replace(/\n?\/[/*][#@] sourceMappingURL=[^\n]*(\*\/)?/g, '');
      if (out !== src) {
        writeFileSync(path, out);
        stripped++;
      }
    }
  }
};
walk(DIST);

console.log(`prepare-publish: ${removed} source maps eliminados, ${stripped} referencias quitadas → ${DIST}`);

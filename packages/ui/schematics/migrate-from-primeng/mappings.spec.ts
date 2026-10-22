/**
 * Protege los mapeos contra cambios en CaribeNG: si un componente renombra o
 * elimina un input, output, símbolo o icono que el migrador escribe, este test
 * falla en vez de generar código que no compila en los proyectos migrados.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { PRIME_ICONS, catalogExport, isCoreIcon } from './icons';
import { ATTR_SYMBOLS, MAPPINGS, ROOT_SERVICES, TAG_SYMBOLS } from './mappings';
import type { Binding, ElementRewrite } from './mappings/types';

/** Raíz del repo desde dist/out-tsc/schematics/migrate-from-primeng. */
const ROOT = join(__dirname, '../../../..');
const UI = join(ROOT, 'packages/ui');

/** Carpeta del entry point (`@caribeng/ui/button` → packages/ui/button). */
const entryDir = (entry: string) => join(UI, entry.replace(/^@caribeng\/ui\/?/, '') || '.', 'src');

/** Inputs, models (y su `xChange`) y outputs declarados en las fuentes del entry point. */
function caribeApi(entry: string): Set<string> {
  const names = new Set<string>();
  const lib = join(entryDir(entry), 'lib');
  for (const file of readdirSync(lib).filter((f) => f.endsWith('.ts') && !f.endsWith('.spec.ts'))) {
    const source = readFileSync(join(lib, file), 'utf8');
    for (const [, name, kind] of source.matchAll(/(\w+) = (input|model|output)\b/g)) {
      names.add(name);
      if (kind === 'model') names.add(`${name}Change`);
    }
    // Inputs con alias (`input('', { alias: 'cbTooltip' })`): en la plantilla se usa el alias.
    for (const [, alias] of source.matchAll(/alias: '(\w+)'/g)) names.add(alias);
  }
  return names;
}

/** Atributos del DOM que el migrador puede escribir en un host CaribeNG. */
const NATIVE = new Set(['class', 'click', 'focusin', 'focusout']);

/** Nombre de input/output de un atributo escrito (`[(visible)]="x"` → visible). */
const attrName = (attr: string) => /^(?:\[\(|\[|\()?([A-Za-z][\w-]*)/.exec(attr)![1];

/** Ejecuta cada regla con un valor de ejemplo y recoge los atributos que escribe. */
function writtenAttrs(rules: Record<string, (b: Binding, el: ElementRewrite) => void>, tag: string): string[] {
  const attrs: string[] = [];
  for (const [key, rule] of Object.entries(rules)) {
    const event = key.startsWith('(');
    const name = event ? key.slice(1, -1) : key;
    for (const binding of [
      { kind: event ? 'event' : 'static', name, value: event ? 'f($event.value)' : 'small', bare: false, source: key },
      { kind: event ? 'event' : 'property', name, value: event ? 'f()' : 'x', bare: false, source: key },
    ] as Binding[]) {
      const el: ElementRewrite = { tag, attrs: [], before: [], after: [], todos: [], icons: new Set(), bindings: [binding], find: () => undefined };
      rule(binding, el);
      attrs.push(...el.attrs);
    }
  }
  return attrs;
}

describe('mapeos PrimeNG → CaribeNG', () => {
  for (const mapping of MAPPINGS) {
    describe(mapping.name, () => {
      const api = caribeApi(mapping.entry);

      it(`el entry point ${mapping.entry} exporta los símbolos de destino`, () => {
        const publicApi = readFileSync(join(entryDir(mapping.entry), 'public-api.ts'), 'utf8');
        for (const symbols of Object.values(mapping.modules)) {
          for (const symbol of Object.values(symbols)) assert.match(publicApi, new RegExp(`\\b${symbol}\\b`), `${mapping.entry} no exporta ${symbol}`);
        }
      });

      for (const element of mapping.elements) {
        const selector = element.tag ?? element.attr;

        it(`${selector}: los inputs/outputs que escriben las reglas existen en ${element.to}`, () => {
          for (const attr of writtenAttrs(element.rules, element.to)) {
            const name = attrName(attr);
            assert.ok(api.has(name) || NATIVE.has(name), `${element.to} no tiene "${name}" (escrito por una regla de ${selector})`);
          }
        });

        it(`${selector}: los inputs con el mismo nombre (same) existen en ${element.to}`, () => {
          for (const name of element.same ?? []) assert.ok(api.has(name), `${element.to} ya no tiene "${name}"`);
        });
      }

      for (const directive of mapping.directives ?? []) {
        it(`${directive.attr}: ${directive.to} y los inputs que escriben sus reglas existen en ${mapping.symbol}`, () => {
          assert.ok(api.has(directive.to), `${mapping.symbol} no tiene el input "${directive.to}"`);
          for (const attr of writtenAttrs(directive.rules, directive.to)) {
            const name = attrName(attr);
            assert.ok(api.has(name), `${mapping.symbol} no tiene "${name}" (escrito por una regla de ${directive.attr})`);
          }
          for (const name of directive.same ?? []) assert.ok(api.has(name), `${mapping.symbol} ya no tiene "${name}"`);
        });
      }
    });
  }

  it('cada tag y directiva de destino tiene un símbolo que importar y su entry point lo exporta', () => {
    for (const mapping of MAPPINGS) {
      for (const element of mapping.elements) assert.ok(TAG_SYMBOLS.has(element.to), `sin símbolo para ${element.to}`);
      for (const directive of mapping.directives ?? []) assert.ok(ATTR_SYMBOLS.has(directive.to), `sin símbolo para ${directive.to}`);
    }
    for (const [tag, symbol] of [...TAG_SYMBOLS, ...ATTR_SYMBOLS]) {
      const publicApi = join(entryDir(symbol.entry), 'public-api.ts');
      assert.ok(existsSync(publicApi), `no existe ${symbol.entry}`);
      assert.match(readFileSync(publicApi, 'utf8'), new RegExp(`\\b${symbol.name}\\b`), `${symbol.entry} no exporta ${symbol.name} (${tag})`);
    }
  });

  it("los servicios que se quitan de providers son providedIn: 'root'", () => {
    for (const mapping of MAPPINGS) {
      for (const service of mapping.rootServices ?? []) {
        assert.ok(ROOT_SERVICES.has(service));
        const lib = join(entryDir(mapping.entry), 'lib');
        const sources = readdirSync(lib)
          .filter((f) => f.endsWith('.ts') && !f.endsWith('.spec.ts'))
          .map((f) => readFileSync(join(lib, f), 'utf8'));
        const declared = sources.find((source) => new RegExp(`export class ${service}\\b`).test(source));
        assert.ok(declared, `${mapping.entry} no declara ${service}`);
        assert.match(declared!, new RegExp(`providedIn: 'root'[\\s\\S]*?export class ${service}\\b`), `${service} no es providedIn: 'root'`);
      }
    }
  });

  it('cada icono de PRIME_ICONS existe en el set núcleo o en @caribeng/ui/icons', () => {
    const catalog = new Set([...readFileSync(join(UI, 'icons/src/lib/catalog.ts'), 'utf8').matchAll(/^export const (\w+) =/gm)].map((m) => m[1]));
    const missing = Object.entries(PRIME_ICONS).filter(([, name]) => !isCoreIcon(name) && !catalog.has(catalogExport(name)));
    assert.deepEqual(missing, [], `iconos sin destino: ${missing.map(([pi, name]) => `pi-${pi} → ${name}`).join(', ')}`);
  });
});

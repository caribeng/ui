import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ensureComponentImports, findComponents, replaceInlineTemplate, rewriteImports } from './typescript';

const rewrite = (code: string) => rewriteImports('/x.ts', code).text;

describe('typescript: imports', () => {
  it('ButtonModule de primeng/button → CbButton de @caribeng/ui/button, y sus usos', () => {
    const out = rewrite(
      [
        "import { Component } from '@angular/core';",
        "import { ButtonModule } from 'primeng/button';",
        '',
        '@Component({ selector: "x", imports: [ButtonModule], template: "" })',
        'export class X {}',
      ].join('\n'),
    );
    assert.match(out, /^import \{ CbButton \} from '@caribeng\/ui\/button';$/m);
    assert.match(out, /imports: \[CbButton\]/);
    assert.doesNotMatch(out, /primeng|ButtonModule/);
  });

  it('dos símbolos que van al mismo destino se importan una vez', () => {
    const out = rewrite(["import { ButtonModule, Button } from 'primeng/button';", '@Component({ imports: [ButtonModule, Button] })', 'class X {}'].join('\n'));
    assert.match(out, /^import \{ CbButton \} from 'primeng\/button'|^import \{ CbButton \} from '@caribeng\/ui\/button';$/m);
    assert.match(out, /imports: \[CbButton\]/);
  });

  it('los símbolos sin equivalente se quedan importados de PrimeNG', () => {
    const out = rewrite(["import { ButtonModule, ButtonLabel } from 'primeng/button';", 'const a = [ButtonModule, ButtonLabel];'].join('\n'));
    assert.match(out, /import \{ CbButton \} from '@caribeng\/ui\/button';\nimport \{ ButtonLabel \} from 'primeng\/button';/);
  });

  it('respeta alias y comillas dobles; no toca nombres de propiedades', () => {
    const out = rewrite(['import { Dialog as PDialog, DialogModule } from "primeng/dialog";', 'class X { DialogModule = 1; d?: PDialog; m = [DialogModule]; }'].join('\n'));
    assert.match(out, /import \{ CbDialog as PDialog, CbDialog \} from "@caribeng\/ui\/dialog";/);
    assert.match(out, /DialogModule = 1; d\?: PDialog; m = \[CbDialog\]/);
  });

  it('no duplica un import que ya existe', () => {
    const out = rewrite(["import { CbSelect } from '@caribeng/ui/select';", "import { SelectModule } from 'primeng/select';", 'const a = [CbSelect, SelectModule];'].join('\n'));
    assert.equal((out.match(/import \{ CbSelect \}/g) ?? []).length, 1);
    assert.match(out, /const a = \[CbSelect, CbSelect\]/);
  });

  it('providePrimeNG(…) → provideCaribeNG(…) y quita el preset de @primeuix', () => {
    const out = rewrite(
      [
        "import { ApplicationConfig } from '@angular/core';",
        "import { providePrimeNG } from 'primeng/config';",
        "import Aura from '@primeuix/themes/aura';",
        '',
        'export const appConfig: ApplicationConfig = {',
        '  providers: [providePrimeNG({ theme: { preset: Aura } })],',
        '};',
      ].join('\n'),
    );
    assert.match(out, /^import \{ provideCaribeNG \} from '@caribeng\/ui';$/m);
    assert.match(out, /providers: \[provideCaribeNG\(\{ locale: 'es', theme: 'light', preset: 'emerald' \}\) \/\* TODO\(caribeng\): .*\*\/\]/);
    assert.doesNotMatch(out, /primeuix|Aura|primeng/);
  });

  it('si provideCaribeNG() ya existe (ng add), elimina providePrimeNG()', () => {
    const out = rewrite(
      [
        "import { provideCaribeNG } from '@caribeng/ui';",
        "import { providePrimeNG } from 'primeng/config';",
        "import Aura from '@primeuix/themes/aura';",
        'export const c = { providers: [provideRouter(r), providePrimeNG({ theme: { preset: Aura } }), provideCaribeNG({})] };',
      ].join('\n'),
    );
    assert.equal(out, ["import { provideCaribeNG } from '@caribeng/ui';", 'export const c = { providers: [provideRouter(r), provideCaribeNG({})] };'].join('\n'));
  });

  it('archivos sin PrimeNG no cambian', () => {
    const code = "import { Component } from '@angular/core';\nexport class X {}\n";
    assert.equal(rewriteImports('/x.ts', code).changed, false);
  });
});

describe('typescript: componentes', () => {
  const component = [
    "import { Component } from '@angular/core';",
    "import { CbButton } from '@caribeng/ui/button';",
    '',
    '@Component({',
    "  selector: 'app-x',",
    '  imports: [CbButton],',
    '  template: `<cb-button><cb-icon name="check" /></cb-button>`,',
    '})',
    'export class X {}',
  ].join('\n');

  it('encuentra la plantilla en línea y la sustituye', () => {
    const [info] = findComponents('/x.ts', component);
    assert.equal(info.inlineTemplate, '<cb-button><cb-icon name="check" /></cb-button>');
    const out = replaceInlineTemplate('/x.ts', component, 0, '<p>`${a}`</p>');
    assert.match(out, /template: `<p>\\`\\\$\{a\}\\`<\/p>`,/);
  });

  it('añade los símbolos que usa la plantilla al imports del componente y su import', () => {
    const out = ensureComponentImports('/x.ts', component, new Map([[0, [{ name: 'CbIcon', entry: '@caribeng/ui/icon' }]]])).text;
    assert.match(out, /imports: \[CbButton, CbIcon\],/);
    assert.match(out, /import \{ CbButton \} from '@caribeng\/ui\/button';\nimport \{ CbIcon \} from '@caribeng\/ui\/icon';/);
  });

  it('crea imports: [] si el componente no lo tenía', () => {
    const code = "@Component({\n  selector: 'x',\n  templateUrl: './x.html',\n})\nexport class X {}";
    const out = ensureComponentImports('/x.ts', code, new Map([[0, [{ name: 'CbDialog', entry: '@caribeng/ui/dialog' }]]])).text;
    assert.match(out, /templateUrl: '.\/x.html',\n  imports: \[CbDialog\],\n\}\)/);
    assert.match(out, /^import \{ CbDialog \} from '@caribeng\/ui\/dialog';\n/);
  });

  it('componentes de NgModule: lo deja para el informe', () => {
    const code = "@Component({ selector: 'x', standalone: false, template: '' })\nexport class X {}";
    const result = ensureComponentImports('/x.ts', code, new Map([[0, [{ name: 'CbIcon', entry: '@caribeng/ui/icon' }]]]));
    assert.equal(result.changed, false);
    assert.deepEqual(result.manual, ['CbIcon']);
  });
});

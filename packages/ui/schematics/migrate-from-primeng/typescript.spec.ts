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

describe('typescript: MessageService → CbToastService', () => {
  const component = (body: string) =>
    [
      "import { Component, inject } from '@angular/core';",
      "import { MessageService, FilterService } from 'primeng/api';",
      "import { ToastModule } from 'primeng/toast';",
      '',
      '@Component({',
      "  selector: 'app-x',",
      '  imports: [ToastModule],',
      '  providers: [MessageService],',
      "  template: '<p-toast />',",
      '})',
      'export class X {',
      body,
      '}',
    ].join('\n');

  it('renombra el servicio, lo quita de providers y conserva los demás símbolos de primeng/api', () => {
    const out = rewrite(component('  private readonly messages = inject(MessageService);'));
    assert.match(out, /^import \{ CbToastService, CbToast \} from '@caribeng\/ui\/toast';$/m, 'un solo import por entry point');
    assert.equal((out.match(/from '@caribeng\/ui\/toast'/g) ?? []).length, 1);
    assert.match(out, /import \{ FilterService \} from 'primeng\/api';/);
    assert.match(out, /providers: \[\],/);
    assert.match(out, /inject\(CbToastService\)/);
  });

  it("traduce severity, sticky y quita key con aviso", () => {
    const out = rewrite(
      component(
        [
          '  private readonly messages = inject(MessageService);',
          "  ok() { this.messages.add({ severity: 'error', summary: 'Error', detail: 'Falló', sticky: true, key: 'tc' }); }",
          "  aviso() { this.messages.add({ severity: 'warn', summary: 'Ojo' }); }",
        ].join('\n'),
      ),
    );
    assert.match(out, /\/\* TODO\(caribeng\): key: 'tc' — CbToastService no tiene estos campos. \*\/ this\.messages\.add\(\{ severity: 'danger', summary: 'Error', detail: 'Falló', life: 0 \}\)/);
    assert.match(out, /this\.messages\.add\(\{ severity: 'warning', summary: 'Ojo' \}\)/);
  });

  it('servicio inyectado por constructor y clear(key)', () => {
    const out = rewrite(component(['  constructor(private ms: MessageService) {}', "  limpiar() { this.ms.clear('tc'); }"].join('\n')));
    assert.match(out, /constructor\(private ms: CbToastService\)/);
    assert.match(out, /\/\* TODO\(caribeng\): cb-toast no tiene key: clear\(\) cierra todos los mensajes. \*\/ this\.ms\.clear\(\)/);
  });

  it('objeto en varias líneas conserva el formato', () => {
    const out = rewrite(
      component(
        ['  private ms = inject(MessageService);', '  ok() {', '    this.ms.add({', "      severity: 'error',", "      summary: 'Error',", '    });', '  }'].join('\n'),
      ),
    );
    assert.match(out, /this\.ms\.add\(\{\n      severity: 'danger',\n      summary: 'Error',\n    \}\);/);
  });

  it('providers con otros servicios: solo quita CbToastService', () => {
    const out = rewrite(
      ["import { MessageService, FilterService } from 'primeng/api';", 'export const c = { providers: [MessageService, FilterService] };'].join('\n'),
    );
    assert.match(out, /providers: \[FilterService\]/);
    assert.match(out, /import \{ FilterService \} from 'primeng\/api';/);
  });
});

describe('typescript: ConfirmationService → CbConfirmationService', () => {
  const component = (body: string) =>
    [
      "import { Component, inject } from '@angular/core';",
      "import { ConfirmationService } from 'primeng/api';",
      "import { ConfirmDialogModule } from 'primeng/confirmdialog';",
      '',
      '@Component({',
      "  selector: 'app-x',",
      '  imports: [ConfirmDialogModule],',
      '  providers: [ConfirmationService],',
      "  template: '<p-confirmdialog />',",
      '})',
      'export class X {',
      '  private readonly confirmation = inject(ConfirmationService);',
      body,
      '}',
    ].join('\n');

  it('importa el servicio del entry point primario y lo quita de providers', () => {
    const out = rewrite(component(''));
    assert.match(out, /^import \{ CbConfirmationService \} from '@caribeng\/ui';$/m);
    assert.match(out, /^import \{ CbConfirmDialog \} from '@caribeng\/ui\/confirmdialog';$/m);
    assert.match(out, /providers: \[\],/);
    assert.match(out, /inject\(CbConfirmationService\)/);
    assert.doesNotMatch(out, /primeng/);
  });

  it('acceptButtonProps → acceptSeverity/acceptLabel; conserva message, header, accept y target', () => {
    const out = rewrite(
      component(
        [
          '  borrar(event: Event, id: number) {',
          '    this.confirmation.confirm({',
          '      target: event.target as EventTarget,',
          "      message: '¿Eliminar?',",
          "      header: 'Confirmar',",
          "      acceptButtonProps: { severity: 'danger', label: 'Eliminar' },",
          "      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },",
          '      accept: () => this.eliminar(id),',
          '    });',
          '  }',
        ].join('\n'),
      ),
    );
    assert.match(
      out,
      /this\.confirmation\.confirm\(\{\n      target: event\.target as EventTarget,\n      message: '¿Eliminar\?',\n      header: 'Confirmar',\n      acceptLabel: 'Eliminar',\n      rejectLabel: 'Cancelar',\n      accept: \(\) => this\.eliminar\(id\),\n      acceptSeverity: 'danger',\n    \}\)/,
    );
    assert.match(out, /\/\* TODO\(caribeng\): rejectButtonProps\.severity: 'secondary', rejectButtonProps\.outlined: true — CbConfirmationService no tiene estas opciones/);
  });

  it("acceptButtonStyleClass 'p-button-danger' (PrimeNG ≤ 17) → acceptSeverity; icon con aviso", () => {
    const out = rewrite(
      component("  ok() { this.confirmation.confirm({ message: '¿Seguro?', icon: 'pi pi-exclamation-triangle', acceptButtonStyleClass: 'p-button-danger p-button-text' }); }"),
    );
    assert.match(out, /this\.confirmation\.confirm\(\{ message: '¿Seguro\?', acceptSeverity: 'danger' \}\)/);
    assert.match(out, /TODO\(caribeng\): icon: 'pi pi-exclamation-triangle' — /);
  });

  it('una confirmación sin cambios no se toca', () => {
    const out = rewrite(component("  ok() { this.confirmation.confirm({ message: 'Hola', accept: () => {} }); }"));
    assert.match(out, /this\.confirmation\.confirm\(\{ message: 'Hola', accept: \(\) => \{\} \}\)/);
    assert.doesNotMatch(out, /TODO/);
  });
});

describe('typescript: MenuItem', () => {
  const file = (body: string) =>
    [
      "import { Component } from '@angular/core';",
      "import { MenuItem } from 'primeng/api';",
      "import { MenubarModule } from 'primeng/menubar';",
      '',
      "@Component({ selector: 'x', imports: [MenubarModule], template: '' })",
      'export class X {',
      body,
      '}',
    ].join('\n');

  it('toma el tipo del menú que recibe el array en la plantilla', () => {
    const result = rewriteImports('/x.ts', file('  items: MenuItem[] = [];\n  acciones: MenuItem[] = [];'), [
      '<p-menubar [model]="items" /><p-menu #m [model]="acciones" [popup]="true" />',
    ]);
    assert.match(result.text, /items: CbMenubarItem\[\] = \[\];\n  acciones: CbMenuItem\[\] = \[\];/);
    assert.match(result.text, /^import \{ CbMenubar, CbMenubarItem \} from '@caribeng\/ui\/menubar';$/m);
    assert.match(result.text, /^import \{ CbMenuItem \} from '@caribeng\/ui\/menu';$/m);
    assert.doesNotMatch(result.text, /primeng\/api/);
  });

  it('traduce los items: icono, routerLink, command y campos sin equivalente', () => {
    const result = rewriteImports(
      '/x.ts',
      file(
        [
          '  items: MenuItem[] = [',
          "    { label: 'Inicio', icon: 'pi pi-home', routerLink: '/' },",
          "    { label: 'Pedidos', icon: 'pi pi-bookmark', routerLink: ['/pedidos'], badge: '3' },",
          '    { separator: true },',
          "    { label: 'Más', items: [{ label: 'Salir', icon: 'pi pi-sign-out', command: () => this.salir() }] },",
          "    { label: 'Detalle', routerLink: ['/pedidos', this.id] },",
          '  ];',
        ].join('\n'),
      ),
      ['<p-menubar [model]="items" />'],
    );
    const out = result.text;
    assert.match(out, /\{ label: 'Inicio', icon: 'house', url: '\/' \}/);
    assert.match(out, /\/\* TODO\(caribeng\): badge: '3' — .*\*\/ \{ label: 'Pedidos', icon: 'bookmark', url: '\/pedidos' \}/);
    assert.match(out, /\/\* TODO\(caribeng\): CbMenubarItem no admite separadores; quita este item\. \*\/ \{ separator: true \}/);
    assert.match(out, /items: \[\{ label: 'Salir', icon: 'log-out', command: \(\) => this\.salir\(\) \}\]/);
    assert.match(out, /\/\* TODO\(caribeng\): routerLink: \['\/pedidos', this\.id\] — .*\*\/ \{ label: 'Detalle' \}/);
    assert.deepEqual([...result.icons].sort(), ['bookmark', 'house', 'log-out']);
  });

  it("separadores de p-menu: label '' (obligatorio en CaribeNG)", () => {
    const out = rewriteImports('/x.ts', file("  acciones: MenuItem[] = [{ label: 'A' }, { separator: true }];"), ['<p-menu #m [model]="acciones" [popup]="true" />']).text;
    assert.match(out, /acciones: CbMenuItem\[\] = \[\{ label: 'A' \}, \{ label: '', separator: true \}\];/);
  });

  it('asignaciones this.items = [...] en ngOnInit', () => {
    const out = rewriteImports(
      '/x.ts',
      file(["  items!: MenuItem[];", '  ngOnInit() {', "    this.items = [{ label: 'A', icon: 'pi pi-check' }];", '  }'].join('\n')),
      ['<p-menubar [model]="items"></p-menubar>'],
    ).text;
    assert.match(out, /items!: CbMenubarItem\[\];/);
    assert.match(out, /this\.items = \[\{ label: 'A', icon: 'check' \}\];/);
  });

  it('sin plantilla que lo use: tipo genérico con aviso (una sola vez)', () => {
    const out = rewriteImports('/x.ts', file('  a: MenuItem[] = [];\n  b: MenuItem[] = [];')).text;
    assert.equal((out.match(/TODO\(caribeng\): no se encontró en la plantilla/g) ?? []).length, 1);
    assert.match(out, /b: CbMenubarItem\[\] = \[\];/);
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

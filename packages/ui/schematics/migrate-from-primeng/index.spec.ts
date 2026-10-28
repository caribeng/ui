import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { SchematicTestRunner, type UnitTestTree } from '@angular-devkit/schematics/testing';

const runner = new SchematicTestRunner('@caribeng/ui', join(__dirname, '../collection.json'));
const angular = new SchematicTestRunner('@schematics/angular', join(dirname(require.resolve('@schematics/angular/utility')), '..', 'collection.json'));

const APP = '/projects/demo/src/app';

/** App Angular con PrimeNG 21 configurado como lo deja su guía de instalación. */
async function createPrimengApp(versions: Record<string, string> = {}): Promise<UnitTestTree> {
  const workspace = await angular.runSchematic('workspace', { name: 'ws', newProjectRoot: 'projects', version: '22.0.0' });
  const tree = await angular.runSchematic('application', { name: 'demo', standalone: true, skipTests: true }, workspace);

  const pkg = JSON.parse(tree.readText('/package.json'));
  Object.assign(pkg.dependencies, { primeng: '^21.1.0', primeicons: '^7.0.0', '@primeuix/themes': '^1.2.0', '@caribeng/ui': '^22.2.0', ...versions });
  tree.overwrite('/package.json', JSON.stringify(pkg, null, 2));

  const config = JSON.parse(tree.readText('/angular.json'));
  config.projects.demo.architect.build.options.styles.push('node_modules/primeicons/primeicons.css');
  tree.overwrite('/angular.json', JSON.stringify(config, null, 2));
  tree.overwrite('/projects/demo/src/styles.css', '@import "primeicons/primeicons.css";\n\nbody { margin: 0; }\n');

  tree.overwrite(
    `${APP}/app.config.ts`,
    [
      "import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';",
      "import { providePrimeNG } from 'primeng/config';",
      "import Aura from '@primeuix/themes/aura';",
      '',
      'export const appConfig: ApplicationConfig = {',
      '  providers: [provideBrowserGlobalErrorListeners(), providePrimeNG({ theme: { preset: Aura } })],',
      '};',
      '',
    ].join('\n'),
  );
  tree.overwrite(
    `${APP}/app.ts`,
    [
      "import { Component, signal } from '@angular/core';",
      "import { FormsModule } from '@angular/forms';",
      "import { ButtonModule } from 'primeng/button';",
      "import { DialogModule } from 'primeng/dialog';",
      "import { InputTextModule } from 'primeng/inputtext';",
      "import { SelectModule } from 'primeng/select';",
      '',
      '@Component({',
      "  selector: 'app-root',",
      '  imports: [FormsModule, ButtonModule, DialogModule, InputTextModule, SelectModule],',
      "  templateUrl: './app.html',",
      '})',
      'export class App {',
      '  protected readonly abierto = signal(false);',
      '  protected nombre = "";',
      '  protected ciudad = null;',
      '  protected ciudades = [{ nombre: "Lima" }];',
      '}',
      '',
    ].join('\n'),
  );
  tree.overwrite(
    `${APP}/app.html`,
    [
      '<p-button label="Guardar" icon="pi pi-bookmark" (onClick)="abierto.set(true)" />',
      '<input pInputText id="nombre" [(ngModel)]="nombre" />',
      '<p-select [options]="ciudades" optionLabel="nombre" [(ngModel)]="ciudad" appendTo="body" />',
      '<p-dialog header="Hola" [(visible)]="abierto" [modal]="true" [style]="{ width: \'25rem\' }">',
      '  <p>Contenido</p>',
      '  <ng-template #footer>',
      '    <p-button label="Cerrar" [text]="true" (onClick)="abierto.set(false)" />',
      '  </ng-template>',
      '</p-dialog>',
      '',
    ].join('\n'),
  );
  tree.create(
    `${APP}/buscar.ts`,
    [
      "import { Component } from '@angular/core';",
      '',
      '@Component({',
      "  selector: 'app-buscar',",
      '  template: `<label><i class="pi pi-search"></i> Buscar</label>`,',
      '})',
      'export class Buscar {}',
      '',
    ].join('\n'),
  );
  return tree;
}

const migrate = (tree: UnitTestTree, options: Record<string, unknown> = {}) => runner.runSchematic('migrate-from-primeng', { skipInstall: true, ...options }, tree);
const deps = (tree: UnitTestTree) => JSON.parse(tree.readText('/package.json')).dependencies as Record<string, string>;

describe('ng generate @caribeng/ui:migrate-from-primeng', () => {
  it('migra plantillas, componentes, proveedor, estilos e iconos', async () => {
    const tree = await migrate(await createPrimengApp());

    const html = tree.readText(`${APP}/app.html`);
    assert.doesNotMatch(html, /<p-|pInputText|pi pi-/);
    assert.match(html, /<cb-button \(click\)="abierto.set\(true\)"><cb-icon name="bookmark" \/>Guardar<\/cb-button>/);
    assert.match(html, /<cb-input inputId="nombre" \[\(ngModel\)\]="nombre" \/>/);
    assert.match(html, /<cb-select \[options\]="ciudades" optionLabel="nombre" \[\(ngModel\)\]="ciudad" \/>/);
    assert.match(html, /<cb-dialog header="Hola" \[\(visible\)\]="abierto" width="25rem">/);
    assert.match(html, /<div cb-dialog-footer>\n    <cb-button variant="text" \(click\)="abierto.set\(false\)">Cerrar<\/cb-button>\n  <\/div>/);

    const app = tree.readText(`${APP}/app.ts`);
    assert.match(app, /imports: \[FormsModule, CbButton, CbDialog, CbInput, CbSelect, CbIcon\]/);
    for (const line of [
      "import { CbButton } from '@caribeng/ui/button';",
      "import { CbDialog } from '@caribeng/ui/dialog';",
      "import { CbInput } from '@caribeng/ui/input';",
      "import { CbSelect } from '@caribeng/ui/select';",
      "import { CbIcon } from '@caribeng/ui/icon';",
    ]) {
      assert.ok(app.includes(line), `falta: ${line}`);
    }
    assert.doesNotMatch(app, /primeng/);

    const buscar = tree.readText(`${APP}/buscar.ts`);
    assert.match(buscar, /template: `<label><cb-icon name="search" \/> Buscar<\/label>`,\n  imports: \[CbIcon\]/);
    assert.match(buscar, /import \{ CbIcon \} from '@caribeng\/ui\/icon';/);

    const config = tree.readText(`${APP}/app.config.ts`);
    assert.match(config, /provideCaribeNG\(\{ locale: 'es', theme: 'light', preset: 'emerald' \}\)/);
    assert.match(config, /provideCbIcons\(\{ 'bookmark': bookmark \}\)/, 'registra los iconos fuera del set núcleo');
    assert.match(config, /import \{ bookmark \} from '@caribeng\/ui\/icons';/);
    assert.doesNotMatch(config, /primeng|primeuix|Aura/);
    assert.equal((config.match(/provideCaribeNG\(/g) ?? []).length, 1);

    const styles = JSON.parse(tree.readText('/angular.json')).projects.demo.architect.build.options.styles as string[];
    assert.equal(styles[0], '@caribeng/ui/styles.css');
    assert.ok(!styles.some((s) => s.includes('primeicons')));
    assert.equal(tree.readText('/projects/demo/src/styles.css'), '\nbody { margin: 0; }\n');

    const dependencies = deps(tree);
    assert.equal(dependencies['primeng'], undefined);
    assert.equal(dependencies['primeicons'], undefined);
    assert.equal(dependencies['@primeuix/themes'], undefined);
    assert.equal(dependencies['@caribeng/ui'], '^22.2.0');

    const report = tree.readText('/caribeng-migration-report.md');
    assert.match(report, /Referencias a PrimeNG sin migrar: \*\*0\*\*/);
    assert.match(report, /Paquetes eliminados de package.json: `primeng`, `primeicons`, `@primeuix\/themes`/);
    assert.match(report, /provideCaribeNG|elige locale/);
  });

  it('migra tag, toast con MessageService, card, tooltip y checkbox', async () => {
    const app = await createPrimengApp();
    app.create(
      `${APP}/panel.ts`,
      [
        "import { Component, inject } from '@angular/core';",
        "import { FormsModule } from '@angular/forms';",
        "import { MessageService } from 'primeng/api';",
        "import { CardModule } from 'primeng/card';",
        "import { CheckboxModule } from 'primeng/checkbox';",
        "import { TagModule } from 'primeng/tag';",
        "import { ToastModule } from 'primeng/toast';",
        "import { TooltipModule } from 'primeng/tooltip';",
        '',
        '@Component({',
        "  selector: 'app-panel',",
        '  imports: [FormsModule, CardModule, CheckboxModule, TagModule, ToastModule, TooltipModule],',
        '  providers: [MessageService],',
        "  templateUrl: './panel.html',",
        '})',
        'export class Panel {',
        '  private readonly messages = inject(MessageService);',
        '  protected acepto = false;',
        "  guardar() { this.messages.add({ severity: 'warn', summary: 'Guardado', sticky: true }); }",
        '}',
        '',
      ].join('\n'),
    );
    app.create(
      `${APP}/panel.html`,
      [
        '<p-toast position="bottom-right" />',
        '<p-card header="Pedido" subheader="#123">',
        '  <p-tag value="Pendiente" severity="warn" icon="pi pi-clock" />',
        '  <p-checkbox [(ngModel)]="acepto" [binary]="true" inputId="acepto" />',
        '  <label for="acepto" pTooltip="Obligatorio">Acepto</label>',
        '</p-card>',
        '',
      ].join('\n'),
    );

    const tree = await migrate(app);
    assert.equal(
      tree.readText(`${APP}/panel.html`),
      [
        '<cb-toast position="bottom-right" />',
        '<cb-card header="Pedido" subtitle="#123">',
        '  <cb-tag value="Pendiente" severity="warning" icon="clock" />',
        '  <cb-checkbox [(ngModel)]="acepto" inputId="acepto" />',
        '  <label for="acepto" cbTooltip="Obligatorio">Acepto</label>',
        '</cb-card>',
        '',
      ].join('\n'),
    );
    const panel = tree.readText(`${APP}/panel.ts`);
    assert.match(panel, /imports: \[FormsModule, CbCard, CbCheckbox, CbTag, CbToast, CbTooltipDirective\]/);
    assert.match(panel, /providers: \[\]/);
    assert.match(panel, /import \{ CbToastService, CbToast \} from '@caribeng\/ui\/toast';/);
    assert.match(panel, /inject\(CbToastService\)/);
    assert.match(panel, /this\.messages\.add\(\{ severity: 'warning', summary: 'Guardado', life: 0 \}\)/);
    assert.doesNotMatch(panel, /primeng/);
    // `clock` es del set núcleo: no se registra con provideCbIcons.
    assert.doesNotMatch(tree.readText(`${APP}/app.config.ts`), /'clock'/);
    assert.equal(deps(tree)['primeng'], undefined);
  });

  it('formulario completo: controles migrados y radios pendientes que siguen compilando', async () => {
    const app = await createPrimengApp();
    app.create(
      `${APP}/formulario.ts`,
      [
        "import { Component } from '@angular/core';",
        "import { ReactiveFormsModule } from '@angular/forms';",
        "import { DatePickerModule } from 'primeng/datepicker';",
        "import { InputNumberModule } from 'primeng/inputnumber';",
        "import { MultiSelectModule } from 'primeng/multiselect';",
        "import { RadioButtonModule } from 'primeng/radiobutton';",
        "import { TextareaModule } from 'primeng/textarea';",
        "import { ToggleSwitchModule } from 'primeng/toggleswitch';",
        '',
        '@Component({',
        "  selector: 'app-formulario',",
        '  imports: [ReactiveFormsModule, DatePickerModule, InputNumberModule, MultiSelectModule, RadioButtonModule, TextareaModule, ToggleSwitchModule],',
        "  templateUrl: './formulario.html',",
        '})',
        'export class Formulario {}',
        '',
      ].join('\n'),
    );
    app.create(
      `${APP}/formulario.html`,
      [
        '<textarea pTextarea formControlName="nota" rows="3"></textarea>',
        '<p-inputnumber formControlName="cantidad" min="1" />',
        '<p-multiselect formControlName="etiquetas" [options]="etiquetas" />',
        '<p-toggleswitch formControlName="activo" />',
        '<p-datepicker formControlName="entrega" dateFormat="dd/mm/yy" />',
        '<p-radiobutton name="talla" value="M" formControlName="talla" />',
        '',
      ].join('\n'),
    );

    const tree = await migrate(app);
    const html = tree.readText(`${APP}/formulario.html`);
    assert.match(html, /<cb-textarea formControlName="nota" \[rows\]="3" \/>/);
    assert.match(html, /<cb-input-number formControlName="cantidad" \[min\]="1" \/>/);
    assert.match(html, /<cb-multiselect formControlName="etiquetas" \[options\]="etiquetas" \/>/);
    assert.match(html, /<cb-toggle formControlName="activo" \/>/);
    assert.match(html, /<cb-datepicker formControlName="entrega" dateFormat="dd\/mm\/yy" editable \/>/);
    assert.match(html, /<!-- TODO\(caribeng\): agrupa los radios .*-->\n<p-radiobutton/);

    const ts = tree.readText(`${APP}/formulario.ts`);
    assert.match(ts, /imports: \[ReactiveFormsModule, CbDatepicker, CbInputNumber, CbMultiSelect, RadioButtonModule, CbTextarea, CbToggle\]/);
    assert.match(ts, /import \{ RadioButtonModule \} from 'primeng\/radiobutton';/, 'el radio sigue compilando con PrimeNG');
    assert.equal(deps(tree)['primeng'], '^21.1.0', 'PrimeNG se queda mientras haya radios sin migrar');
    assert.match(tree.readText('/caribeng-migration-report.md'), /<p-radiobutton name="talla"/);
  });

  it('menús con MenuItem y tabs: tipos, imports e iconos usados en el código', async () => {
    const app = await createPrimengApp();
    app.create(
      `${APP}/navegacion.ts`,
      [
        "import { Component } from '@angular/core';",
        "import { MenuItem } from 'primeng/api';",
        "import { MenubarModule } from 'primeng/menubar';",
        "import { TabsModule } from 'primeng/tabs';",
        '',
        '@Component({',
        "  selector: 'app-navegacion',",
        '  imports: [MenubarModule, TabsModule],',
        "  templateUrl: './navegacion.html',",
        '})',
        'export class Navegacion {',
        '  items: MenuItem[] = [',
        "    { label: 'Guardados', icon: 'pi pi-bookmark', routerLink: '/guardados' },",
        "    { label: 'Salir', icon: 'pi pi-sign-out', command: () => this.salir() },",
        '  ];',
        '  salir() {}',
        '}',
        '',
      ].join('\n'),
    );
    app.create(
      `${APP}/navegacion.html`,
      [
        '<p-menubar [model]="items" />',
        '<p-tabs value="a">',
        '  <p-tablist><p-tab value="a">Uno</p-tab></p-tablist>',
        '  <p-tabpanels><p-tabpanel value="a">Contenido</p-tabpanel></p-tabpanels>',
        '</p-tabs>',
        '',
      ].join('\n'),
    );

    const tree = await migrate(app);
    const ts = tree.readText(`${APP}/navegacion.ts`);
    assert.match(ts, /items: CbMenubarItem\[\] = \[/);
    assert.match(ts, /\{ label: 'Guardados', icon: 'bookmark', url: '\/guardados' \}/);
    assert.match(ts, /\{ label: 'Salir', icon: 'log-out', command: \(\) => this\.salir\(\) \}/);
    assert.match(ts, /import \{ CbMenubar, CbMenubarItem \} from '@caribeng\/ui\/menubar';/);
    assert.match(ts, /import \{ CbTabs, CbTab \} from '@caribeng\/ui\/tabs';/);
    assert.match(ts, /imports: \[CbMenubar, CbTabs, CbTab\]/);
    assert.doesNotMatch(ts, /primeng/);

    assert.match(tree.readText(`${APP}/navegacion.html`), /<cb-menubar \[items\]="items" \/>\n<cb-tabs>\n  <cb-tab label="Uno">Contenido<\/cb-tab>\n<\/cb-tabs>/);
    // `bookmark` solo aparece en el TypeScript y no es del set núcleo: se registra.
    assert.match(tree.readText(`${APP}/app.config.ts`), /provideCbIcons\(\{ 'bookmark': bookmark \}\)/);
  });

  it('p-table: convierte la tabla estática e importa sus directivas; la que no se puede convertir conserva TableModule', async () => {
    const app = await createPrimengApp();
    const component = (name: string) =>
      [
        "import { Component } from '@angular/core';",
        "import { CurrencyPipe } from '@angular/common';",
        "import { TableModule } from 'primeng/table';",
        '',
        '@Component({',
        `  selector: 'app-${name}',`,
        '  imports: [CurrencyPipe, TableModule],',
        `  templateUrl: './${name}.html',`,
        '})',
        `export class ${name[0].toUpperCase()}${name.slice(1)} {}`,
        '',
      ].join('\n');
    app.create(`${APP}/estatica.ts`, component('estatica'));
    app.create(
      `${APP}/estatica.html`,
      '<p-table [value]="filas"><ng-template #header><tr><th>Precio</th></tr></ng-template><ng-template #body let-f><tr><td>{{ f.precio | currency }}</td></tr></ng-template></p-table>\n',
    );
    app.create(`${APP}/dinamica.ts`, component('dinamica'));
    app.create(
      `${APP}/dinamica.html`,
      '<p-table [value]="filas" [columns]="cols"><ng-template #header let-columns><tr>@for (c of columns; track c) {<th>{{ c.header }}</th>}</tr></ng-template><ng-template #body let-f let-columns="columns"><tr>@for (c of columns; track c) {<td>{{ formatear(f, c) }}</td>}</tr></ng-template></p-table>\n',
    );

    const tree = await migrate(app);
    const estatica = tree.readText(`${APP}/estatica.ts`);
    assert.match(estatica, /imports: \[CurrencyPipe, CbTable, CbTableCellDirective\]/);
    assert.match(estatica, /import \{ CbTable, CbTableCellDirective \} from '@caribeng\/ui\/table';/);
    assert.doesNotMatch(estatica, /primeng/);
    assert.match(tree.readText(`${APP}/estatica.html`), /<ng-template cbTableCell="precio" let-f>\{\{ f\.precio \| currency \}\}<\/ng-template>/);

    const dinamica = tree.readText(`${APP}/dinamica.ts`);
    assert.match(dinamica, /import \{ TableModule \} from 'primeng\/table';/, 'la tabla sin convertir sigue compilando');
    assert.match(dinamica, /imports: \[CurrencyPipe, CbTable, TableModule\]/);
    assert.match(tree.readText(`${APP}/dinamica.html`), /^<!-- TODO\(caribeng\): la celda dinámica muestra algo distinto/);
    assert.equal(deps(tree)['primeng'], '^21.1.0');
  });

  it('p-table con columnas dinámicas: [columns] del componente con sortable añadido y tipo CbTableColumn', async () => {
    const app = await createPrimengApp();
    app.create(
      `${APP}/listado.ts`,
      [
        "import { Component } from '@angular/core';",
        "import { TableModule } from 'primeng/table';",
        '',
        'interface Column {',
        '  field: string;',
        '  header: string;',
        '}',
        '',
        '@Component({',
        "  selector: 'app-listado',",
        '  imports: [TableModule],',
        "  templateUrl: './listado.html',",
        '})',
        'export class Listado {',
        '  cols: Column[] = [',
        "    { field: 'codigo', header: 'Código' },",
        "    { field: 'precio', header: 'Precio' },",
        '  ];',
        '}',
        '',
      ].join('\n'),
    );
    app.create(
      `${APP}/listado.html`,
      [
        '<p-table [value]="filas" [columns]="cols">',
        '  <ng-template #header let-columns>',
        '    <tr>',
        '      @for (col of columns; track col.field) {',
        '        <th [pSortableColumn]="col.field">{{ col.header }} <p-sortIcon [field]="col.field" /></th>',
        '      }',
        '    </tr>',
        '  </ng-template>',
        '  <ng-template #body let-fila let-columns="columns">',
        '    <tr>',
        '      @for (col of columns; track col.field) {',
        '        <td>{{ fila[col.field] }}</td>',
        '      }',
        '    </tr>',
        '  </ng-template>',
        '</p-table>',
        '',
      ].join('\n'),
    );

    const tree = await migrate(app);
    const ts = tree.readText(`${APP}/listado.ts`);
    assert.match(ts, /cols: CbTableColumn\[\] = \[\n    \{ field: 'codigo', header: 'Código', sortable: true \},\n    \{ field: 'precio', header: 'Precio', sortable: true \},\n  \];/);
    assert.match(ts, /import \{ CbTable, CbTableColumn \} from '@caribeng\/ui\/table';/);
    assert.match(ts, /imports: \[CbTable\]/);
    assert.doesNotMatch(ts, /primeng/);
    assert.match(tree.readText(`${APP}/listado.html`), /<cb-table\n  \[value\]="filas"\n  \[columns\]="cols"\n><\/cb-table>/);
  });

  it('con referencias pendientes mantiene PrimeNG instalado y las lista en el informe', async () => {
    const app = await createPrimengApp();
    app.overwrite(`${APP}/app.html`, `<p-table [value]="filas"></p-table>\n<p-button label="X" />\n`);
    const tree = await migrate(app);
    assert.equal(deps(tree)['primeng'], '^21.1.0');
    const report = tree.readText('/caribeng-migration-report.md');
    assert.match(report, /Referencias a PrimeNG sin migrar: \*\*1\*\*/);
    assert.match(report, /- Línea 1: p-table sin plantillas header y body\./);
    assert.match(report, /## Referencias a PrimeNG pendientes[\s\S]*### `projects\/demo\/src\/app\/app.html`\n\n- Línea 2: <p-table/);
  });

  it('--path migra solo esa carpeta', async () => {
    const app = await createPrimengApp();
    app.create('/projects/demo/src/otra/otra.html', '<p-button label="Fuera" />\n');
    const tree = await migrate(app, { path: 'projects/demo/src/app' });
    assert.match(tree.readText(`${APP}/app.html`), /<cb-button/);
    assert.equal(tree.readText('/projects/demo/src/otra/otra.html'), '<p-button label="Fuera" />\n');
    assert.equal(deps(tree)['primeng'], '^21.1.0', 'quedan referencias fuera de --path');
  });

  it('--report=false no escribe el informe; --remove-primeng=false conserva las dependencias', async () => {
    const tree = await migrate(await createPrimengApp(), { report: false, removePrimeng: false });
    assert.ok(!tree.exists('/caribeng-migration-report.md'));
    assert.equal(deps(tree)['primeng'], '^21.1.0');
  });

  it('programa la instalación cuando quita dependencias', async () => {
    await runner.runSchematic('migrate-from-primeng', {}, await createPrimengApp());
    assert.ok(runner.tasks.some((task) => task.name === 'node-package'));
  });

  it('exige @caribeng/ui instalado', async () => {
    const app = await createPrimengApp();
    const pkg = JSON.parse(app.readText('/package.json'));
    delete pkg.dependencies['@caribeng/ui'];
    app.overwrite('/package.json', JSON.stringify(pkg));
    await assert.rejects(migrate(app), /npm install @caribeng\/ui@22/);
    await assert.doesNotReject(migrate(app, { skipChecks: true }));
  });

  it('rechaza PrimeNG anterior a la 18 salvo con --skip-checks', async () => {
    await assert.rejects(migrate(await createPrimengApp({ primeng: '^17.18.0' })), /PrimeNG \^17\.18\.0/);
    await assert.doesNotReject(migrate(await createPrimengApp({ primeng: '^17.18.0' }), { skipChecks: true }));
  });

  it('es idempotente: una segunda ejecución no cambia nada', async () => {
    const first = await migrate(await createPrimengApp());
    const snapshot = new Map(first.files.map((path) => [path, first.read(path)!.toString('base64')]));
    const second = await migrate(first, { skipChecks: true });
    for (const path of second.files) {
      if (path === '/caribeng-migration-report.md') continue;
      assert.equal(second.read(path)!.toString('base64'), snapshot.get(path), `cambió ${path}`);
    }
  });
});

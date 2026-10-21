import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { SchematicTestRunner, type UnitTestTree } from '@angular-devkit/schematics/testing';
import { CARIBENG_STYLES } from './index';

const runner = new SchematicTestRunner('@caribeng/ui', join(__dirname, '../collection.json'));
const angular = new SchematicTestRunner('@schematics/angular', join(dirname(require.resolve('@schematics/angular/utility')), '..', 'collection.json'));

/** Workspace con una aplicación generada por el schematic oficial de Angular. */
async function createApp(standalone = true): Promise<UnitTestTree> {
  const workspace = await angular.runSchematic('workspace', { name: 'ws', newProjectRoot: 'projects', version: '22.0.0' });
  return angular.runSchematic('application', { name: 'demo', standalone, skipTests: true }, workspace);
}

function styles(tree: UnitTestTree, target = 'build'): unknown[] {
  const config = JSON.parse(tree.readText('/angular.json'));
  return config.projects.demo.architect[target]?.options?.styles ?? [];
}

const count = (text: string, part: string) => text.split(part).length - 1;

describe('ng add @caribeng/ui', () => {
  it('app standalone: registra provideCaribeNG() en app.config.ts con las opciones por defecto', async () => {
    const tree = await runner.runSchematic('ng-add', {}, await createApp());
    const config = tree.readText('/projects/demo/src/app/app.config.ts');
    assert.match(config, /import \{ provideCaribeNG \} from '@caribeng\/ui';/);
    assert.match(config, /provideCaribeNG\(\{ locale: 'es', theme: 'light', preset: 'emerald' \}\)/);
  });

  it('aplica el idioma, el tema y la paleta elegidos', async () => {
    const tree = await runner.runSchematic('ng-add', { locale: 'en', theme: 'system', preset: 'ocean' }, await createApp());
    const config = tree.readText('/projects/demo/src/app/app.config.ts');
    assert.match(config, /provideCaribeNG\(\{ locale: 'en', theme: 'system', preset: 'ocean' \}\)/);
  });

  it('añade la hoja de estilos al principio de build y test en angular.json', async () => {
    const tree = await runner.runSchematic('ng-add', {}, await createApp());
    const build = styles(tree);
    assert.equal(build[0], CARIBENG_STYLES);
    assert.ok(build.length >= 2, 'conserva los estilos propios de la app');
    const test = styles(tree, 'test');
    if (test.length) assert.equal(test[0], CARIBENG_STYLES);
  });

  it('con --styles=false no toca angular.json', async () => {
    const tree = await runner.runSchematic('ng-add', { styles: false }, await createApp());
    assert.ok(!styles(tree).includes(CARIBENG_STYLES));
  });

  it('es idempotente: ejecutarlo dos veces no duplica el proveedor ni los estilos', async () => {
    let tree = await runner.runSchematic('ng-add', {}, await createApp());
    tree = await runner.runSchematic('ng-add', { locale: 'en' }, tree);
    const config = tree.readText('/projects/demo/src/app/app.config.ts');
    assert.equal(count(config, 'provideCaribeNG('), 1);
    assert.match(config, /locale: 'es'/, 'conserva la configuración existente');
    assert.equal(styles(tree).filter((s) => s === CARIBENG_STYLES).length, 1);
  });

  it('no duplica la hoja si ya estaba con otra ruta', async () => {
    const app = await createApp();
    const config = JSON.parse(app.readText('/angular.json'));
    config.projects.demo.architect.build.options.styles.unshift('node_modules/@caribeng/ui/styles/caribeng.css');
    app.overwrite('/angular.json', JSON.stringify(config, null, 2));
    const tree = await runner.runSchematic('ng-add', {}, app);
    assert.ok(!styles(tree).includes(CARIBENG_STYLES));
  });

  it('app con NgModule: registra el proveedor en AppModule', async () => {
    const tree = await runner.runSchematic('ng-add', { theme: 'dark' }, await createApp(false));
    const module = tree.readText('/projects/demo/src/app/app-module.ts');
    assert.match(module, /import \{ provideCaribeNG \} from '@caribeng\/ui';/);
    assert.match(module, /provideCaribeNG\(\{ locale: 'es', theme: 'dark', preset: 'emerald' \}\)/);
  });

  it('falla con un mensaje claro si el proyecto no existe', async () => {
    await assert.rejects(runner.runSchematic('ng-add', { project: 'no-existe' }, await createApp()), /No existe el proyecto "no-existe"/);
  });
});

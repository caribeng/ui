import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbFloatMenu } from '@caribeng/ui/caribe/float-menu';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-float-menu-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbFloatMenu],
  template: `
    <cb-doc-page
      category="Caribe Design · Navegación"
      title="FloatMenu"
      subtitle="Barra de navegación flotante tipo píldora para vistas móviles y web."
      importCode="import { CbFloatMenu } from '@caribeng/ui/caribe/float-menu';"
      [api]="api"
    >
      <cb-doc-example title="Barra flotante" code='<cb-float-menu [items]="items" [activeId]="active()" />'>
        <cb-float-menu [items]="items" [activeId]="active()" (select)="active.set($event.id)" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class FloatMenuDocComponent {
  protected readonly docApi = DOC_API['cb-float-menu'];

  protected readonly active = signal('home');
  protected readonly items = [
    { id: 'home', label: 'Inicio' },
    { id: 'cards', label: 'Productos' },
    { id: 'profile', label: 'Perfil' },
  ];
  protected readonly api: CbDocApiRow[] = [
    { name: 'items', type: 'readonly CbFloatMenuItem[]', default: '[]', description: 'Opciones de navegación.' },
    { name: 'activeId', type: 'string', default: "''", description: 'Identificador del ítem activo.' },
  ];
}

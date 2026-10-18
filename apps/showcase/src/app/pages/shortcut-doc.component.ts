import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbShortcut } from '@caribeng/ui/caribe/shortcut';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-shortcut-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbShortcut],
  template: `
    <cb-doc-page
      category="Caribe Design · Navegación"
      title="Shortcut"
      subtitle="Botón de acceso directo con icono y etiqueta para acciones frecuentes."
      importCode="import { CbShortcut } from '@caribeng/ui/caribe/shortcut';"
      [api]="api"
    >
      <cb-doc-example title="Atajos transaccionales" code='<cb-shortcut label="Transferir" icon="arrow-right" />'>
        <div style="display: flex; gap: 0.75rem">
          <cb-shortcut label="Transferir" icon="arrow-right" />
          <cb-shortcut label="Certificados" icon="check" />
        </div>
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class ShortcutDocComponent {
  protected readonly docApi = DOC_API['cb-shortcut'];

  protected readonly api: CbDocApiRow[] = [
    { name: 'label', type: 'string', default: "'Transferir'", description: 'Texto del atajo.' },
    { name: 'icon', type: 'string', default: "'arrow-right'", description: 'Icono superior.' },
    { name: 'action', type: 'OutputEmitterRef<void>', default: '—', description: 'Evento al activar el atajo.' },
  ];
}
